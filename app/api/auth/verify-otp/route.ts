import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import OTP from '../../../../models/OTP';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json();

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: 'Email, OTP, and type are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const otpType = type === 'user' ? 'FORGOT_PASSWORD_USER' : 'FORGOT_PASSWORD_DOCTOR';

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: otpType,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    return NextResponse.json(
      { message: 'OTP verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







