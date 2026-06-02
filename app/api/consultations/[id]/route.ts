import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Consultation from '../../../../models/Consultation';
import mongoose from 'mongoose';
import { getAuthJwt, jwtUserId } from '../../../../lib/route-auth';
import { isConsultationMeetingLive } from '../../../../lib/consultation-utils';

// Update consultation (accept/reject/complete)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = await getAuthJwt(request);
    const doctorId = jwtUserId(token!);

    if (!token || token.role !== 'DOCTOR' || !doctorId) {
      return NextResponse.json({ error: 'Only doctors can update consultations' }, { status: 403 });
    }

    const params = context.params;
    const resolvedParams = params instanceof Promise ? await params : params;
    const consultationId = resolvedParams.id;

    if (!mongoose.Types.ObjectId.isValid(consultationId)) {
      return NextResponse.json({ error: 'Invalid consultation ID' }, { status: 400 });
    }

    const { status, doctorResponse, scheduledAt } = await request.json();

    await dbConnect();

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Verify this consultation belongs to the doctor
    if (consultation.doctorId.toString() !== doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (
      status === 'ACCEPTED' &&
      !isConsultationMeetingLive({
        scheduleActive: consultation.scheduleActive,
        status: consultation.status,
      })
    ) {
      return NextResponse.json(
        { error: 'Payment must be verified before accepting' },
        { status: 400 }
      );
    }

    // Update consultation
    if (status) {
      consultation.status = status;
    }
    if (doctorResponse) {
      consultation.doctorResponse = doctorResponse;
    }
    if (scheduledAt) {
      consultation.scheduledAt = new Date(scheduledAt);
    }
    if (status === 'COMPLETED') {
      consultation.completedAt = new Date();
    }

    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email')
      .populate('reportId');

    return NextResponse.json(
      { message: 'Consultation updated', consultation: populatedConsultation },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating consultation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




