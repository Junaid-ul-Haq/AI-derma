import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { sendEmail, getWelcomeEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log('Database connected, creating user...');

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('User already exists:', normalizedEmail);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed, creating user...');

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log('User created successfully:', user._id);

    // Send welcome email
    try {
      const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin`;
      const welcomeEmailHtml = getWelcomeEmail(user.name, loginUrl);
      
      await sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to AI Dermatology Platform! 🎉',
        html: welcomeEmailHtml,
      });
      console.log('Welcome email sent to:', normalizedEmail);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the signup if email fails
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // More detailed error logging
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