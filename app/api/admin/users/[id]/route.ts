import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt } from '../../../../../lib/route-auth';
import dbConnect from '../../../../../lib/db';
import User from '../../../../../models/User';
import Consultation from '../../../../../models/Consultation';

// GET user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthJwt(request);

    if (!token?.email || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's consultations count
    const consultationsCount = await Consultation.countDocuments({ userId: user._id });

    return NextResponse.json({
      user: {
        ...user.toObject(),
        consultationsCount,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// DELETE user permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthJwt(request);

    if (!token?.email || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin users
    if ((user as any).role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete user's consultations
    await Consultation.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'User deleted permanently',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

