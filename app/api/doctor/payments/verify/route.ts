import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../../lib/route-auth';
import dbConnect from '../../../../../lib/db';
import Consultation from '../../../../../models/Consultation';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);

    if (!token || token.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorId = jwtUserId(token);
    if (!doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { consultationId, action } = await request.json();

    if (!consultationId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the consultation
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctorId,
      paymentScreenshot: { $exists: true },
      paymentVerified: false,
    });

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation not found or already processed' },
        { status: 404 }
      );
    }

    if (action === 'accept') {
      // Accept payment and confirm booking
      consultation.paymentVerified = true;
      consultation.paymentVerifiedAt = new Date();
      consultation.status = 'ACCEPTED';
      consultation.scheduleActive = true;
      
      await consultation.save();

      return NextResponse.json({
        message: 'Payment verified and consultation confirmed successfully!',
        consultation,
      });
    } else {
      // Reject payment
      consultation.status = 'REJECTED';
      // Clear payment screenshot
      consultation.paymentScreenshot = undefined;
      
      await consultation.save();

      return NextResponse.json({
        message: 'Payment rejected and consultation cancelled.',
        consultation,
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
