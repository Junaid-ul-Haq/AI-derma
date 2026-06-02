import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, temporaryPassword } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    const doctor = await Doctor.findOne({ email: email.toLowerCase() });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    if (doctor.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Account not approved' },
        { status: 403 }
      );
    }

    // Verify temporary password if setting password for first time
    if (!doctor.passwordSet && temporaryPassword) {
      if (doctor.temporaryPassword !== temporaryPassword) {
        return NextResponse.json(
          { error: 'Invalid temporary password' },
          { status: 401 }
        );
      }
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(password, 12);
    doctor.password = hashedPassword;
    doctor.passwordSet = true;
    doctor.temporaryPassword = undefined; // Clear temporary password
    await doctor.save();

    return NextResponse.json(
      { message: 'Password set successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







