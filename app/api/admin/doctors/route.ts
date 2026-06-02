import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../lib/route-auth';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';

// Get all doctors (for admin)
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);

    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const doctors = await Doctor.find({})
      .select('-password -temporaryPassword')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



