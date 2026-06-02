// PUT /api/consultations/[id]/start
// Doctor calls this to start the video call.
// Creates a Stream call + VideoRoom doc, moves status → IN_CALL,
// then pushes a Socket.io notification to the patient.
import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../../lib/route-auth';
import dbConnect from '../../../../../lib/db';
import Consultation from '../../../../../models/Consultation';
import VideoRoom from '../../../../../models/VideoRoom';
import Notification from '../../../../../models/Notification';
import { createStreamCall } from '../../../../../lib/stream';
import { emitToUser } from '../../../../../lib/notify';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = await getAuthJwt(request);
    const doctorId = jwtUserId(token!);
    if (!token || token.role !== 'DOCTOR' || !doctorId) {
      return NextResponse.json({ error: 'Doctors only' }, { status: 403 });
    }

    const { id } = context.params instanceof Promise ? await context.params : context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await dbConnect();
    const consultation = await Consultation.findById(id);
    if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (consultation.doctorId.toString() !== doctorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (consultation.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Consultation must be ACCEPTED before starting a call' },
        { status: 400 }
      );
    }

    // Create unique room ID
    const roomId = `room-${uuidv4()}`;

    // Create Stream call (non-fatal if Stream keys not set yet)
    try {
      await createStreamCall(roomId, doctorId, consultation.userId.toString());
    } catch (streamErr) {
      console.warn('Stream call creation skipped:', (streamErr as Error).message);
    }

    // Persist VideoRoom
    await VideoRoom.create({
      roomId,
      consultationId: consultation._id,
      doctorId:       consultation.doctorId,
      patientId:      consultation.userId,
      isActive:       true,
      startedAt:      new Date(),
    });

    // Update consultation
    consultation.status    = 'IN_CALL';
    consultation.roomId    = roomId;
    consultation.startedAt = new Date();
    await consultation.save();

    // Notify patient in real-time
    const note = await Notification.create({
      userId:         consultation.userId,
      userType:       'USER',
      type:           'CALL_STARTED',
      title:          'Doctor Started the Call',
      message:        `Your consultation has started. Join the video call now!`,
      consultationId: consultation._id,
      roomId,
    });

    emitToUser(consultation.userId.toString(), 'notification', note.toObject());
    emitToUser(consultation.userId.toString(), 'call-started', {
      consultationId: consultation._id.toString(),
      roomId,
    });

    return NextResponse.json({ roomId, consultation }, { status: 200 });
  } catch (err) {
    console.error('[start]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
