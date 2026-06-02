import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';
import Consultation from '../../../../models/Consultation';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const doctor = await Doctor.findById(id)
      .select('name email profileImage description consultationHours professionalExperience age bankDetails')
      .lean();

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    if (doctor.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Doctor not available' },
        { status: 403 }
      );
    }

    // Get booked slots for the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookedConsultations = await Consultation.find({
      doctorId: doctor._id,
      status: { $in: ['PENDING', 'ACCEPTED'] },
      slotDate: {
        $gte: today,
        $lte: nextWeek,
      },
    }).select('slotDate slotTime').lean();

    const bookedSlots = bookedConsultations.map((c) => ({
      date: c.slotDate?.toISOString().split('T')[0],
      time: c.slotTime,
    }));

    return NextResponse.json({
      doctor: {
        _id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        profileImage: doctor.profileImage || null,
        description: doctor.description || '',
        consultationHours: doctor.consultationHours || {
          startTime: '17:00',
          endTime: '21:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          slotDuration: 30,
        },
        professionalExperience: doctor.professionalExperience || 0,
        age: doctor.age || 0,
        bankDetails: doctor.bankDetails || {
          accountTitle: '',
          accountNumber: '',
          bankName: '',
          iban: '',
        },
      },
      bookedSlots,
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor' },
      { status: 500 }
    );
  }
}

