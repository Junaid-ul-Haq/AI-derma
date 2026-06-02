import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../lib/route-auth';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

// Get all users (for admin)
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

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






