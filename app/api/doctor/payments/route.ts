import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../lib/route-auth';
import dbConnect from '../../../../lib/db';
import Consultation from '../../../../models/Consultation';

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);

    if (!token || token.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorId = jwtUserId(token);
    if (!doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get consultations with payment proof but not verified
    const consultations = await Consultation.find({
      doctorId,
      paymentScreenshot: { $exists: true },
      paymentVerified: false,
      status: 'PENDING',
    })
      .populate('userId', 'name email')
      .sort({ paymentSubmittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      consultations,
    });

  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
