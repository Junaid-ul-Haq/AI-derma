// GET  /api/admin/consultations        — all consultations with full detail
// PUT  /api/admin/consultations?id=X   — verify payment for a consultation
import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../lib/route-auth';
import dbConnect from '../../../../lib/db';
import Consultation from '../../../../models/Consultation';
import Notification from '../../../../models/Notification';
import { emitToUser } from '../../../../lib/notify';

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const doctorFilter = searchParams.get('doctorId');

    const query: any = {};
    if (statusFilter && statusFilter !== 'ALL') query.status = statusFilter;
    if (doctorFilter) query.doctorId = doctorFilter;

    const consultations = await Consultation.find(query)
      .populate('userId',   'name email')
      .populate('doctorId', 'name email profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ consultations });
  } catch (err) {
    console.error('[admin/consultations GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await dbConnect();

    const consultation = await Consultation.findByIdAndUpdate(
      id,
      { paymentVerified: true, paymentVerifiedAt: new Date() },
      { new: true }
    ).lean() as any;

    if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Notify patient that payment has been verified
    const note = await Notification.create({
      userId:         consultation.userId,
      userType:       'USER',
      type:           'PAYMENT_VERIFIED',
      title:          'Payment Verified',
      message:        'Your consultation payment has been verified by the admin.',
      consultationId: consultation._id,
    });

    emitToUser(consultation.userId.toString(), 'notification', note.toObject());

    return NextResponse.json({ success: true, consultation });
  } catch (err) {
    console.error('[admin/consultations PUT]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
