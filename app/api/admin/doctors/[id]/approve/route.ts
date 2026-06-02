import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../../../lib/route-auth';
import mongoose from 'mongoose';
import dbConnect from '../../../../../../lib/db';
import Doctor from '../../../../../../models/Doctor';
import { sendEmail, getDoctorApprovalEmail } from '../../../../../../lib/email';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = await getAuthJwt(request);
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Resolve params (Next.js 15+ uses Promise, 14 uses direct object)
    const params = context.params;
    const resolvedParams = params instanceof Promise ? await params : params;
    const doctorId = resolvedParams.id;

    console.log('Approving doctor with ID:', doctorId);

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { error: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    if (doctor.status === 'APPROVED') {
      return NextResponse.json(
        { 
          error: 'Doctor already approved',
          message: 'This doctor has already been approved. No action needed.'
        },
        { status: 400 }
      );
    }

    // Generate random password
    const randomPassword = crypto.randomBytes(8).toString('hex');

    // Update doctor status
    doctor.status = 'APPROVED';
    const adminId = jwtUserId(token);
    doctor.approvedBy = adminId
      ? new mongoose.Types.ObjectId(adminId)
      : undefined;
    doctor.approvedAt = new Date();
    doctor.temporaryPassword = randomPassword;
    doctor.passwordSet = false; // Explicitly set to false since doctor hasn't set their own password yet
    
    console.log('Approving doctor:', doctor._id);
    await doctor.save();
    console.log('Doctor approved and saved to database:', doctor._id);

    // Send approval email
    const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin?type=doctor`;
    const emailHtml = getDoctorApprovalEmail(
      doctor.name,
      doctor.email,
      randomPassword,
      loginUrl
    );

    await sendEmail({
      to: doctor.email,
      subject: 'Doctor Account Approved - AI Dermatology Platform',
      html: emailHtml,
    });

    return NextResponse.json(
      { 
        message: 'Doctor approved successfully. Email sent with login credentials.',
        doctor 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving doctor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

