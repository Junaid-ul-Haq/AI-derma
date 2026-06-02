// GET /api/admin/stats
// Returns a full system overview for the admin dashboard:
// consultation counts by status, per-doctor breakdown, payment summary, recent activity.
import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../lib/route-auth';
import dbConnect from '../../../../lib/db';
import Consultation from '../../../../models/Consultation';
import User from '../../../../models/User';
import Doctor from '../../../../models/Doctor';

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // ── Run all queries in parallel ──────────────────────────────────────────
    const [
      allConsultations,
      totalUsers,
      allDoctors,
    ] = await Promise.all([
      Consultation.find({})
        .populate('userId',   'name email')
        .populate('doctorId', 'name email profileImage')
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments({}),
      Doctor.find({}).select('_id name email status profileImage').lean(),
    ]);

    const cons = allConsultations as any[];

    // ── Status breakdown ────────────────────────────────────────────────────
    const byStatus = {
      PENDING:   cons.filter(c => c.status === 'PENDING').length,
      ACCEPTED:  cons.filter(c => c.status === 'ACCEPTED').length,
      REJECTED:  cons.filter(c => c.status === 'REJECTED').length,
      IN_CALL:   cons.filter(c => c.status === 'IN_CALL').length,
      COMPLETED: cons.filter(c => c.status === 'COMPLETED').length,
    };

    // ── Payment breakdown ───────────────────────────────────────────────────
    const withPayment     = cons.filter(c => c.paymentScreenshot);
    const paymentVerified = withPayment.filter(c => c.paymentVerified).length;
    const paymentPending  = withPayment.filter(c => !c.paymentVerified).length;

    // ── Per-doctor breakdown ────────────────────────────────────────────────
    const doctorMap: Record<string, {
      doctorId: string;
      name: string;
      email: string;
      profileImage?: string;
      total: number;
      pending: number;
      accepted: number;
      completed: number;
      inCall: number;
      rejected: number;
      paymentsReceived: number;
      paymentsVerified: number;
    }> = {};

    cons.forEach(c => {
      const doc = c.doctorId as any;
      if (!doc?._id) return;
      const key = doc._id.toString();
      if (!doctorMap[key]) {
        doctorMap[key] = {
          doctorId: key,
          name: doc.name ?? 'Unknown',
          email: doc.email ?? '',
          profileImage: doc.profileImage,
          total: 0, pending: 0, accepted: 0,
          completed: 0, inCall: 0, rejected: 0,
          paymentsReceived: 0, paymentsVerified: 0,
        };
      }
      const d = doctorMap[key];
      d.total++;
      if (c.status === 'PENDING')    d.pending++;
      if (c.status === 'ACCEPTED')   d.accepted++;
      if (c.status === 'COMPLETED')  d.completed++;
      if (c.status === 'IN_CALL')    d.inCall++;
      if (c.status === 'REJECTED')   d.rejected++;
      if (c.paymentScreenshot)       d.paymentsReceived++;
      if (c.paymentVerified)         d.paymentsVerified++;
    });

    const perDoctor = Object.values(doctorMap).sort((a, b) => b.total - a.total);

    // ── Recent 10 consultations ─────────────────────────────────────────────
    const recentActivity = cons.slice(0, 10).map(c => ({
      _id:            c._id.toString(),
      patientName:    (c.userId as any)?.name  ?? 'Unknown',
      patientEmail:   (c.userId as any)?.email ?? '',
      doctorName:     (c.doctorId as any)?.name  ?? 'Unknown',
      doctorEmail:    (c.doctorId as any)?.email ?? '',
      status:         c.status,
      slotDate:       c.slotDate,
      slotTime:       c.slotTime,
      paymentVerified: c.paymentVerified,
      paymentScreenshot: c.paymentScreenshot,
      roomId:         c.roomId,
      startedAt:      c.startedAt,
      endedAt:        c.endedAt,
      createdAt:      c.createdAt,
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        totalDoctors:     allDoctors.length,
        approvedDoctors:  allDoctors.filter((d: any) => d.status === 'APPROVED').length,
        pendingDoctors:   allDoctors.filter((d: any) => d.status === 'PENDING').length,
        totalConsultations: cons.length,
        activeCallsNow:   byStatus.IN_CALL,
      },
      byStatus,
      payments: {
        total:    withPayment.length,
        verified: paymentVerified,
        pending:  paymentPending,
      },
      perDoctor,
      recentActivity,
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
