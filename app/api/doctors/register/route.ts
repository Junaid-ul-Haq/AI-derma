import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';

export async function POST(request: NextRequest) {
  try {
    // Allow public registration - doctors register with PENDING status
    // Admin will approve/reject them later

    const body = await request.json();
    const { name, email, age, professionalExperience, phoneNumber, degreeUrl } = body;

    // Validate input
    if (!name || !email || !age || !professionalExperience || !phoneNumber || !degreeUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate age
    if (age < 18 || age > 100) {
      return NextResponse.json(
        { error: 'Age must be between 18 and 100' },
        { status: 400 }
      );
    }

    // Validate experience
    if (professionalExperience < 0) {
      return NextResponse.json(
        { error: 'Professional experience cannot be negative' },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log('Database connected, creating doctor registration request...');

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email: normalizedEmail });
    if (existingDoctor) {
      console.log('Doctor already exists:', normalizedEmail);
      return NextResponse.json(
        { error: 'Doctor with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Creating doctor registration request:', { name, email: normalizedEmail, age, professionalExperience });

    // Create doctor with PENDING status - waiting for admin approval
    const doctor = await Doctor.create({
      name: name.trim(),
      email: normalizedEmail,
      age: parseInt(age),
      professionalExperience: parseInt(professionalExperience),
      phoneNumber: phoneNumber.trim(),
      degreeUrl,
      status: 'PENDING',
      passwordSet: false,
    });

    console.log('Doctor registration request created successfully:', doctor._id);

    // Return doctor without sensitive info
    const { password, temporaryPassword, ...doctorResponse } = doctor.toObject();

    return NextResponse.json(
      {
        message: 'Registration submitted successfully! Your request is pending admin approval. You will receive an email with login credentials once approved.',
        doctor: doctorResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Doctor registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

