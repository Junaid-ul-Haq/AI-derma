import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../../../lib/route-auth';
import dbConnect from '../../../../../../lib/db';
import Doctor from '../../../../../../models/Doctor';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = await getAuthJwt(request);
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rejectionReason } = await request.json();

    await dbConnect();

    // Resolve params (Next.js 15+ uses Promise, 14 uses direct object)
    const params = context.params;
    const resolvedParams = params instanceof Promise ? await params : params;
    const doctorId = resolvedParams.id;

    console.log('Rejecting doctor with ID:', doctorId);

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { error: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      console.error('Doctor not found with ID:', doctorId);
      return NextResponse.json(
        { error: `Doctor not found with ID: ${doctorId}` },
        { status: 404 }
      );
    }

    if (doctor.status === 'REJECTED') {
      // If already rejected, delete from database
      await Doctor.findByIdAndDelete(doctorId);
      return NextResponse.json(
        { message: 'Rejected doctor removed from database' },
        { status: 200 }
      );
    }

    // Delete rejected doctor from database instead of keeping them
    await Doctor.findByIdAndDelete(doctorId);

    return NextResponse.json(
      { 
        message: 'Doctor rejected and removed from database successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

