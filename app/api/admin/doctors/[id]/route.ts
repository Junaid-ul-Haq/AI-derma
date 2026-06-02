import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../../lib/route-auth';
import dbConnect from '../../../../../lib/db';
import Doctor from '../../../../../models/Doctor';
import Consultation from '../../../../../models/Consultation';

// GET doctor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthJwt(request);

    if (!token?.email || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const doctor = await Doctor.findById(id).select('-password -temporaryPassword');
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Get doctor's consultations count
    const consultationsCount = await Consultation.countDocuments({ doctorId: doctor._id });
    const pendingConsultations = await Consultation.countDocuments({ 
      doctorId: doctor._id, 
      status: 'PENDING' 
    });
    const completedConsultations = await Consultation.countDocuments({ 
      doctorId: doctor._id, 
      status: 'COMPLETED' 
    });

    return NextResponse.json({
      doctor: {
        ...doctor.toObject(),
        consultationsCount,
        pendingConsultations,
        completedConsultations,
      },
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor' },
      { status: 500 }
    );
  }
}

// PATCH doctor (suspend/unsuspend)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthJwt(request);

    if (!token?.email || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const { suspended } = await request.json();

    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    doctor.suspended = suspended;
    await doctor.save();

    return NextResponse.json({
      message: suspended ? 'Doctor suspended successfully' : 'Doctor unsuspended successfully',
      doctor: {
        ...doctor.toObject(),
        password: undefined,
        temporaryPassword: undefined,
      },
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    );
  }
}

// DELETE doctor permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthJwt(request);

    if (!token?.email || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Delete doctor's consultations
    await Consultation.deleteMany({ doctorId: doctor._id });

    // Delete doctor
    await Doctor.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Doctor deleted permanently',
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
}
