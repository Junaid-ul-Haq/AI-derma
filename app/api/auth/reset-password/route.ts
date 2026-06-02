import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import OTP from '../../../../models/OTP';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword, type } = await request.json();

    if (!email || !otp || !newPassword || !type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    const otpType = type === 'user' ? 'FORGOT_PASSWORD_USER' : 'FORGOT_PASSWORD_DOCTOR';

    // Verify OTP was used (from verify-otp step)
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: otpType,
      used: true,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update password
    if (type === 'user') {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();
    } else {
      const Doctor = (await import('../../../../models/Doctor')).default;
      const doctor = await Doctor.findOne({ email: email.toLowerCase() });
      if (!doctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      doctor.password = hashedPassword;
      doctor.passwordSet = true;
      await doctor.save();
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







