import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../lib/route-auth';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';
import Consultation from '../../../../models/Consultation';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);

    if (!token || token.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = jwtUserId(token);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const doctorId = formData.get('doctorId') as string;
    const slotDate = formData.get('slotDate') as string;
    const slotTime = formData.get('slotTime') as string;
    const message = formData.get('message') as string;
    const file = formData.get('paymentScreenshot') as File;

    if (!doctorId || !slotDate || !slotTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Payment screenshot is required' }, { status: 400 });
    }

    await dbConnect();

    // Verify doctor exists and is approved
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Doctor not found or not approved' }, { status: 404 });
    }

    // Check if slot is already booked
    const existingConsultation = await Consultation.findOne({
      doctorId,
      slotDate: new Date(slotDate),
      slotTime,
      status: { $in: ['PENDING', 'ACCEPTED'] },
    });

    if (existingConsultation) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 400 });
    }

    // Upload payment screenshot
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payments');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `payment_${uid}_${doctorId}_${timestamp}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    await writeFile(filepath, buffer);
    const screenshotUrl = `/uploads/payments/${filename}`;

    // Create scheduled date from slotDate and slotTime
    const scheduledDate = new Date(slotDate);
    const [hours, minutes] = slotTime.split(':').map(Number);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Create consultation with payment proof
    const consultation = await Consultation.create({
      userId: uid,
      doctorId,
      message: message || 'Consultation request',
      slotDate: new Date(slotDate),
      slotTime,
      scheduledAt: scheduledDate,
      status: 'PENDING',
      scheduleActive: false,
      paymentScreenshot: screenshotUrl,
      paymentVerified: false,
      paymentSubmittedAt: new Date(),
    });

    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email');

    return NextResponse.json(
      {
        message: 'Consultation request submitted successfully. Payment verification pending.',
        consultation: populatedConsultation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating consultation with payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
