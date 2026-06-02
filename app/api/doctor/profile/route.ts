import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../lib/db';
import Doctor from '../../../../models/Doctor';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user as any)?.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const email = request.nextUrl.searchParams.get('email') || session.user.email;
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: doctor.name,
      email: doctor.email,
      profileImage: doctor.profileImage || null,
      age: doctor.age,
      professionalExperience: doctor.professionalExperience,
      phoneNumber: doctor.phoneNumber,
      degreeUrl: doctor.degreeUrl,
      description: doctor.description || '',
      consultationHours: doctor.consultationHours || {
        startTime: '17:00',
        endTime: '21:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slotDuration: 30,
      },
      bankDetails: doctor.bankDetails || {
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        iban: '',
      },
      status: doctor.status,
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user as any)?.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { name, profileImage, age, professionalExperience, phoneNumber, description, consultationHours, bankDetails } = body;

    const doctor = await Doctor.findOne({ email: session.user.email.toLowerCase() });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Update fields if provided - save all profile data
    if (name !== undefined) {
      doctor.name = name;
    }
    if (profileImage !== undefined) {
      doctor.profileImage = profileImage;
    }
    if (age !== undefined) {
      doctor.age = age;
    }
    if (professionalExperience !== undefined) {
      doctor.professionalExperience = professionalExperience;
    }
    if (phoneNumber !== undefined) {
      doctor.phoneNumber = phoneNumber;
    }
    if (description !== undefined) {
      doctor.description = description;
    }
    if (consultationHours !== undefined) {
      // Ensure consultationHours has all required fields
      doctor.consultationHours = {
        startTime: consultationHours.startTime || '17:00',
        endTime: consultationHours.endTime || '21:00',
        days: consultationHours.days && consultationHours.days.length > 0 
          ? consultationHours.days 
          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slotDuration: consultationHours.slotDuration || 30,
      };
    }
    if (bankDetails !== undefined) {
      // Ensure bankDetails has all required fields
      doctor.bankDetails = {
        accountTitle: bankDetails.accountTitle || '',
        accountNumber: bankDetails.accountNumber || '',
        bankName: bankDetails.bankName || '',
        iban: bankDetails.iban || '',
      };
    }

    // Save all changes to database
    await doctor.save();

    console.log('Doctor profile updated:', {
      name: doctor.name,
      age: doctor.age,
      professionalExperience: doctor.professionalExperience,
      phoneNumber: doctor.phoneNumber,
      hasDescription: !!doctor.description,
      consultationHours: doctor.consultationHours,
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      doctor: {
        name: doctor.name,
        email: doctor.email,
        profileImage: doctor.profileImage || null,
        age: doctor.age,
        professionalExperience: doctor.professionalExperience,
        phoneNumber: doctor.phoneNumber,
        degreeUrl: doctor.degreeUrl,
        description: doctor.description || '',
        consultationHours: doctor.consultationHours || {
          startTime: '17:00',
          endTime: '21:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          slotDuration: 30,
        },
        bankDetails: doctor.bankDetails || {
          accountTitle: '',
          accountNumber: '',
          bankName: '',
          iban: '',
        },
        status: doctor.status,
      },
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor profile' },
      { status: 500 }
    );
  }
}

