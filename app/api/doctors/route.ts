import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Doctor from '@/models/Doctor';

export async function GET() {
  try {
    console.log('Fetching approved doctors from database...');
    await dbConnect();

    // Query database directly for only APPROVED and non-suspended doctors
    // This is much more efficient than fetching all and filtering
    const approvedDoctors = await Doctor.find({
      status: 'APPROVED',
      suspended: { $ne: true } // Not suspended (or suspended field doesn't exist)
    })
      .select('name profileImage description consultationHours professionalExperience age email bankDetails')
      .lean()
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log(`Found ${approvedDoctors.length} approved doctors in database`);

    // Map to response format
    const doctors = approvedDoctors.map((d: any) => ({
      _id: d._id.toString(),
      name: d.name,
      email: d.email || undefined,
      profileImage: d.profileImage ?? null,
      description: d.description ?? '',
      age: d.age ?? undefined,
      consultationHours: d.consultationHours ?? {
        startTime: '17:00',
        endTime: '21:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slotDuration: 30,
      },
      professionalExperience: d.professionalExperience ?? 0,
      bankDetails: d.bankDetails ?? {
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        iban: '',
      },
    }));

    // Get stats for debugging (optional, can be removed in production)
    const totalDoctors = await Doctor.countDocuments({});
    const pendingCount = await Doctor.countDocuments({ status: 'PENDING' });
    const rejectedCount = await Doctor.countDocuments({ status: 'REJECTED' });

    return NextResponse.json({
      success: true,
      doctors,
      count: doctors.length,
      debug: {
        totalDoctors,
        approvedDoctors: doctors.length,
        pendingDoctors: pendingCount,
        rejectedDoctors: rejectedCount,
      },
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    console.error('Error fetching approved doctors:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch doctors',
        message: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
