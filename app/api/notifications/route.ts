import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../lib/route-auth';
import dbConnect from '../../../lib/db';
import Notification from '../../../models/Notification';
import Doctor from '../../../models/Doctor';

// GET /api/notifications — fetch latest 30 notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    const uid   = jwtUserId(token!);
    if (!token || !uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // For doctors, userId in Notification refers to the Doctor._id
    let targetId = uid;
    if (token.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ email: token.email }).select('_id').lean();
      if (doctor) targetId = (doctor as any)._id.toString();
    }

    const notifications = await Notification.find({ userId: targetId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[notifications GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/notifications — mark all as read
export async function PUT(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    const uid   = jwtUserId(token!);
    if (!token || !uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    let targetId = uid;
    if (token.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ email: token.email }).select('_id').lean();
      if (doctor) targetId = (doctor as any)._id.toString();
    }

    await Notification.updateMany({ userId: targetId, isRead: false }, { isRead: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
