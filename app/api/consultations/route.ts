import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Consultation from '../../../models/Consultation';
import Doctor from '../../../models/Doctor';
import { getAuthJwt, jwtUserId } from '../../../lib/route-auth';
import { isConsultationMeetingLive } from '../../../lib/consultation-utils';

// Get consultations for doctor
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = token.role;
    const uid = jwtUserId(token);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    if (userRole === 'DOCTOR') {
      const consultations = await Consultation.find({ doctorId: uid })
        .populate('userId', 'name email')
        .populate('reportId')
        .sort({ createdAt: -1 })
        .lean();

      const withFlags = consultations.map((c: any) => ({
        ...c,
        meetingLive: isConsultationMeetingLive({
          scheduleActive: c.scheduleActive,
          status: c.status,
        }),
      }));

      return NextResponse.json({ consultations: withFlags }, { status: 200 });
    } else if (userRole === 'USER') {
      const consultations = await Consultation.find({ userId: uid })
        .populate('doctorId', 'name email')
        .populate('reportId')
        .sort({ createdAt: -1 })
        .lean();

      const withFlags = consultations.map((c: any) => ({
        ...c,
        meetingLive: isConsultationMeetingLive({
          scheduleActive: c.scheduleActive,
          status: c.status,
        }),
      }));

      return NextResponse.json({ consultations: withFlags }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new consultation request
export async function POST(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);

    if (!token || token.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = jwtUserId(token);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId, message, reportId, slotDate, slotTime } = await request.json();

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    if (!slotDate || !slotTime) {
      return NextResponse.json({ error: 'Date and time slot are required' }, { status: 400 });
    }

    await dbConnect();

    // Verify doctor exists and is approved
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Doctor not found or not approved' }, { status: 404 });
    }

    // Check if slot is already booked
    const existingConsultation = await Consultation.findOne({
      doctorId,
      slotDate: new Date(slotDate),
      slotTime,
      status: { $in: ['PENDING', 'ACCEPTED'] },
    });

    if (existingConsultation) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 400 });
    }

    // Create scheduled date from slotDate and slotTime
    const scheduledDate = new Date(slotDate);
    const [hours, minutes] = slotTime.split(':').map(Number);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const consultation = await Consultation.create({
      userId: uid,
      doctorId,
      message: message || 'Consultation request',
      reportId,
      slotDate: new Date(slotDate),
      slotTime,
      scheduledAt: scheduledDate,
      status: 'PENDING',
      scheduleActive: false,
    });
    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email');

    return NextResponse.json(
      {
        message: 'Consultation request submitted successfully.',
        consultation: populatedConsultation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


