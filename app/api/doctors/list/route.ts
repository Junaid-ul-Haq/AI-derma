// GET /api/doctors/list — public list of approved doctors for the booking form
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';

export async function GET(_request: NextRequest) {
  try {
    await dbConnect();
    const doctors = await Doctor.find({ status: 'APPROVED', suspended: { $ne: true } })
      .select('_id name description professionalExperience consultationHours profileImage bankDetails')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ doctors });
  } catch (err) {
    console.error('[doctors/list]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
