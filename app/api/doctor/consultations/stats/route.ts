import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import dbConnect from '../../../../../lib/db';
import Consultation from '../../../../../models/Consultation';
import Doctor from '../../../../../models/Doctor';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user as any)?.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const doctor = await Doctor.findOne({ email: session.user.email.toLowerCase() });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Get total consultation requests
    const totalRequests = await Consultation.countDocuments({ doctorId: doctor._id });

    // Get pending consultations
    const pendingCount = await Consultation.countDocuments({ 
      doctorId: doctor._id,
      status: 'PENDING'
    });

    // Get completed consultations
    const completedCount = await Consultation.countDocuments({ 
      doctorId: doctor._id,
      status: 'COMPLETED'
    });

    return NextResponse.json({
      totalRequests,
      pendingCount,
      completedCount,
    });
  } catch (error) {
    console.error('Error fetching consultation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultation stats' },
      { status: 500 }
    );
  }
}

