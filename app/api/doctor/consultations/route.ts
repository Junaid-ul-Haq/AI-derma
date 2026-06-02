import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../lib/db';
import Consultation from '../../../../models/Consultation';
import Doctor from '../../../../models/Doctor';

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

    // Fetch consultations assigned to this doctor
    const consultations = await Consultation.find({ doctorId: doctor._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const consultationsList = consultations.map((consultation) => ({
      _id: consultation._id.toString(),
      userId: consultation.userId,
      createdAt: consultation.createdAt,
      status: consultation.status,
      message: consultation.message,
      doctorResponse: consultation.doctorResponse,
      scheduledAt: consultation.scheduledAt,
      completedAt: consultation.completedAt,
    }));

    return NextResponse.json({
      consultations: consultationsList,
    });
  } catch (error) {
    console.error('Error fetching doctor consultations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}

