import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/models/Setting';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    return NextResponse.json(settings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সেটিংস লোড করা সম্ভব হয়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'শুধুমাত্র খামার মালিক সেটিংস পরিবর্তন করতে পারেন' },
        { status: 403 }
      );
    }

    const body = await req.json();
    await connectToDatabase();

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(body);
    } else {
      Object.assign(settings, body);
    }
    await settings.save();

    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
