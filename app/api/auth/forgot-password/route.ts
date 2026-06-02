import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import OTP from '../../../../models/OTP';
import { sendEmail, getOTPEmail } from '../../../../lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'user' && type !== 'doctor')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "user" or "doctor"' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user/doctor exists
    let user;
    if (type === 'user') {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      const Doctor = (await import('../../../../models/Doctor')).default;
      user = await Doctor.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json(
        { message: 'If the email exists, an OTP has been sent.' },
        { status: 200 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({
      email: email.toLowerCase(),
      type: type === 'user' ? 'FORGOT_PASSWORD_USER' : 'FORGOT_PASSWORD_DOCTOR',
    });

    // Create new OTP
    const otp = await OTP.create({
      email: email.toLowerCase(),
      otp: otpCode,
      type: type === 'user' ? 'FORGOT_PASSWORD_USER' : 'FORGOT_PASSWORD_DOCTOR',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      used: false,
    });

    // Send OTP email
    const emailHtml = getOTPEmail(user.name, otpCode);
    await sendEmail({
      to: email.toLowerCase(),
      subject: 'Password Reset OTP - AI Dermatology Platform',
      html: emailHtml,
    });

    return NextResponse.json(
      { message: 'OTP sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







