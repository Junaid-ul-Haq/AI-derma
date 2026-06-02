import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../../lib/route-auth';
import mongoose from 'mongoose';
import dbConnect from '../../../../../lib/db';
import Doctor from '../../../../../models/Doctor';

// Diagnostic endpoint to check doctor statuses and fix issues
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all doctors with their statuses
    const allDoctors = await Doctor.find({})
      .select('name email status createdAt')
      .lean();

    // Count by status
    const statusCounts = allDoctors.reduce((acc: any, doctor: any) => {
      const status = doctor.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Find doctors that are not APPROVED
    const nonApprovedDoctors = allDoctors.filter((d: any) => d.status !== 'APPROVED');

    return NextResponse.json({
      success: true,
      summary: {
        totalDoctors: allDoctors.length,
        approvedDoctors: statusCounts.APPROVED || 0,
        pendingDoctors: statusCounts.PENDING || 0,
        rejectedDoctors: statusCounts.REJECTED || 0,
        unknownStatus: statusCounts.UNKNOWN || 0,
      },
      statusCounts,
      nonApprovedDoctors: nonApprovedDoctors.map((d: any) => ({
        _id: d._id.toString(),
        name: d.name,
        email: d.email,
        status: d.status || 'UNKNOWN',
        createdAt: d.createdAt,
      })),
      message: nonApprovedDoctors.length > 0 
        ? `Found ${nonApprovedDoctors.length} doctor(s) that are not APPROVED. Use POST /api/admin/doctors/diagnose to approve all or clean up.`
        : 'All doctors in the database are APPROVED.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to diagnose doctors',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint to fix issues - approve all PENDING doctors or remove non-approved
export async function POST(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();
    // action can be: 'approve-all' (approve all PENDING) or 'clean' (remove non-approved)

    await dbConnect();

    if (action === 'approve-all') {
      const adminId = jwtUserId(token!);
      const approvedBy = adminId ? new mongoose.Types.ObjectId(adminId) : undefined;
      const result = await Doctor.updateMany(
        { status: 'PENDING' },
        { 
          $set: { 
            status: 'APPROVED',
            approvedBy,
            approvedAt: new Date(),
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: `Approved ${result.modifiedCount} pending doctor(s)`,
        modifiedCount: result.modifiedCount,
      });
    } else if (action === 'clean') {
      // Remove all non-approved doctors (PENDING and REJECTED)
      const result = await Doctor.deleteMany({
        status: { $ne: 'APPROVED' }
      });

      return NextResponse.json({
        success: true,
        message: `Removed ${result.deletedCount} non-approved doctor(s) from database`,
        deletedCount: result.deletedCount,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve-all" or "clean"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix doctors',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

