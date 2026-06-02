import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../lib/route-auth';
import dbConnect from '../../../../lib/db';
import Consultation from '../../../../models/Consultation';
import { isConsultationMeetingLive } from '../../../../lib/consultation-utils';

/**
 * Admin supervision: all consultations with payment + schedule state for the Payments sidebar page.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const consultations = await Consultation.find({})
      .populate('userId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const rows = consultations.map((c: any) => ({
      _id: c._id.toString(),
      user: c.userId,
      doctor: c.doctorId,
      slotDate: c.slotDate,
      slotTime: c.slotTime,
      scheduleActive: c.scheduleActive,
      meetingLive: isConsultationMeetingLive({
        scheduleActive: c.scheduleActive,
        status: c.status,
      }),
      status: c.status,
      createdAt: c.createdAt,
    }));

    const active = rows.filter((r) => r.scheduleActive);
    const pending = rows.filter((r) =>
      ['PENDING'].includes(r.status || '')
    );

    return NextResponse.json({
      consultations: rows,
      summary: {
        totalRecorded: rows.length,
        activeCount: active.length,
        pendingCount: pending.length,
      },
    });
  } catch (e) {
    console.error('admin payments:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
