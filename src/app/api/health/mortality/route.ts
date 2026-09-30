import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MortalityRecord } from '@/models/MortalityRecord';
import { Flock } from '@/models/Flock';
import { Shed } from '@/models/Shed';
import { getCurrentUser } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const flockId = searchParams.get('flockId');

    const query: any = {};
    if (flockId) query.flockId = flockId;

    const records = await MortalityRecord.find(query)
      .populate('flockId', 'name batchId')
      .sort({ date: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(records);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'মৃত্যুহার রেকর্ড পাওয়া যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

    const body = await req.json();
    const { date, flockId, deadCount, suspectedReason = 'স্বাভাবিক', notes, photoUrl } = body;

    const count = Number(deadCount);
    if (!date || !flockId || !count || count <= 0) {
      return NextResponse.json({ error: 'তারিখ, ফ্লক এবং সঠিক মৃত সংখ্যা দিন' }, { status: 400 });
    }

    await connectToDatabase();

    const flock = await Flock.findById(flockId);
    if (!flock) return NextResponse.json({ error: 'ফ্লক পাওয়া যায়নি' }, { status: 404 });

    const record = await MortalityRecord.create({
      date,
      flockId: flock._id,
      flockName: flock.name,
      deadCount: count,
      suspectedReason: suspectedReason.trim(),
      notes,
      photoUrl,
      recordedByUid: user.uid,
    });

    // Update flock bird count
    flock.currentBirdCount = Math.max(0, flock.currentBirdCount - count);
    await flock.save();

    // Update shed occupancy
    const shed = await Shed.findById(flock.shedId);
    if (shed) {
      shed.currentOccupancy = flock.currentBirdCount;
      await shed.save();
    }

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'MORTALITY',
      recordId: record._id.toString(),
      details: `${flock.name} এ ${count}টি মুরগির মৃত্যু রেকর্ড করা হয়েছে (কারণ: ${suspectedReason})`,
    });

    return NextResponse.json({ success: true, record, remainingBirds: flock.currentBirdCount }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'মৃত্যু রেকর্ড সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
