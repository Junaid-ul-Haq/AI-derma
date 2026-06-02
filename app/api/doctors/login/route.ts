import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, temporaryPassword } = await request.json();

    if (!email || (!password && !temporaryPassword)) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const doctor = await Doctor.findOne({ email: email.toLowerCase() });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (doctor.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Your account is not approved yet. Please wait for admin approval.' },
        { status: 403 }
      );
    }

    let isPasswordValid = false;

    // Check temporary password (first login)
    if (temporaryPassword && doctor.temporaryPassword) {
      isPasswordValid = temporaryPassword === doctor.temporaryPassword;
    }
    // Check regular password (after setting own password)
    else if (password && doctor.password) {
      isPasswordValid = await bcrypt.compare(password, doctor.password);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return doctor info (without sensitive data)
    const { password: _, temporaryPassword: __, ...doctorResponse } = doctor.toObject();

    return NextResponse.json(
      {
        message: 'Login successful',
        doctor: doctorResponse,
        needsPasswordSetup: !doctor.passwordSet,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Doctor login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







