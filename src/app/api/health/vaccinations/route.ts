import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { VaccinationSchedule } from '@/models/VaccinationSchedule';
import { Flock } from '@/models/Flock';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const flockId = searchParams.get('flockId');

    const query: any = {};
    if (flockId) query.flockId = flockId;

    const schedules = await VaccinationSchedule.find(query)
      .populate('flockId', 'name batchId ageInWeeks')
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json(schedules);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'টিকাদান কর্মসূচি লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER'])) {
      return NextResponse.json({ error: 'টিকার সময়সূচি তৈরির অনুমতি নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { flockId, vaccineName, targetBirdAgeWeeks, scheduledDate, dose = '১ ডোজ', route = 'DRINKING_WATER', notes } = body;

    if (!flockId || !vaccineName || !scheduledDate) {
      return NextResponse.json({ error: 'ফ্লক, টিকার নাম ও তারিখ আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();

    const flock = await Flock.findById(flockId);
    if (!flock) return NextResponse.json({ error: 'ফ্লক পাওয়া যায়নি' }, { status: 404 });

    const schedule = await VaccinationSchedule.create({
      flockId: flock._id,
      flockName: flock.name,
      vaccineName: vaccineName.trim(),
      targetBirdAgeWeeks: Number(targetBirdAgeWeeks) || 0,
      scheduledDate,
      dose,
      route,
      status: 'PENDING',
      notes,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'VACCINATION',
      recordId: schedule._id.toString(),
      details: `টিকা সময়সূচি যোগ করা হয়েছে: ${flock.name} এর জন্য ${vaccineName} (${scheduledDate})`,
    });

    return NextResponse.json({ success: true, schedule }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'টিকাদান কর্মসূচি সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

    const body = await req.json();
    const { scheduleId, status = 'COMPLETED', notes } = body;

    if (!scheduleId) return NextResponse.json({ error: 'আইডি আবশ্যক' }, { status: 400 });

    await connectToDatabase();
    const schedule = await VaccinationSchedule.findById(scheduleId);
    if (!schedule) return NextResponse.json({ error: 'কর্মসূচি পাওয়া যায়নি' }, { status: 404 });

    schedule.status = status;
    schedule.administeredDate = new Date().toISOString().split('T')[0];
    schedule.responsiblePerson = user.displayName;
    if (notes) schedule.notes = notes;
    await schedule.save();

    return NextResponse.json({ success: true, schedule });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'আপডেট ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
