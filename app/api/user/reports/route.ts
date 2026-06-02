import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../lib/db';
import Consultation from '../../../../models/Consultation';
import User from '../../../../models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch consultations/reports for the user
    const consultations = await Consultation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const reports = consultations.map((consultation) => ({
      _id: consultation._id.toString(),
      createdAt: consultation.createdAt,
      status: consultation.status,
      message: consultation.message,
      doctorResponse: consultation.doctorResponse,
    }));

    return NextResponse.json({
      reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

