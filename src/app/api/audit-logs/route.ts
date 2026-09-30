import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'অডিট লগ দেখার অনুমতি শুধুমাত্র খামার মালিকের রয়েছে' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
    return NextResponse.json(logs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'অডিট লগ লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
