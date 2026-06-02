// PUT /api/consultations/[id]/end
// Doctor (or patient) ends the call — moves status → COMPLETED.
import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../../lib/route-auth';
import dbConnect from '../../../../../lib/db';
import Consultation from '../../../../../models/Consultation';
import VideoRoom from '../../../../../models/VideoRoom';
import Notification from '../../../../../models/Notification';
import { emitToUser } from '../../../../../lib/notify';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = await getAuthJwt(request);
    const userId = jwtUserId(token!);
    if (!token || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params instanceof Promise ? await context.params : context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await dbConnect();
    const consultation = await Consultation.findById(id);
    if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Both doctor and patient may end the call
    const isDoctor  = token.role === 'DOCTOR' && consultation.doctorId.toString() === userId;
    const isPatient = token.role === 'USER'   && consultation.userId.toString()   === userId;
    if (!isDoctor && !isPatient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    consultation.status  = 'COMPLETED';
    consultation.endedAt = new Date();
    await consultation.save();

    // Deactivate room
    await VideoRoom.findOneAndUpdate(
      { consultationId: consultation._id },
      { isActive: false, endedAt: new Date() }
    );

    // Notify the other party
    const notifyId   = isDoctor ? consultation.userId   : consultation.doctorId;
    const notifyType = isDoctor ? 'USER' : 'DOCTOR';

    const note = await Notification.create({
      userId:         notifyId,
      userType:       notifyType,
      type:           'CALL_ENDED',
      title:          'Consultation Ended',
      message:        `The video consultation has ended.`,
      consultationId: consultation._id,
    });

    emitToUser(notifyId.toString(), 'notification', note.toObject());
    emitToUser(notifyId.toString(), 'call-ended', {
      consultationId: consultation._id.toString(),
    });

    return NextResponse.json({ consultation }, { status: 200 });
  } catch (err) {
    console.error('[end]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
