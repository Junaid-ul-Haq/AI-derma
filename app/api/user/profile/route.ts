import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../lib/db';
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
    
    const email = request.nextUrl.searchParams.get('email') || session.user.email;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || null,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { name, profileImage } = body;

    const user = await User.findOne({ email: session.user.email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update fields if provided - save all profile data
    if (name !== undefined) {
      user.name = name;
    }
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    // Save all changes to database
    await user.save();

    console.log('User profile updated:', {
      name: user.name,
      email: user.email,
      hasProfileImage: !!user.profileImage,
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

