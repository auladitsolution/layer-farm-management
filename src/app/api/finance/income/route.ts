import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Income } from '@/models/Income';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');
    const month = searchParams.get('month');

    const query: any = {};
    if (source) query.source = source;
    if (month) query.date = { $regex: `^${month}` };

    const incomes = await Income.find(query).sort({ date: -1, createdAt: -1 }).limit(100).lean();
    return NextResponse.json(incomes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'আয় তালিকা লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'ACCOUNTANT'])) {
      return NextResponse.json({ error: 'আয় এন্ট্রি করার অনুমতি নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { date, source, description, amount, paymentMethod = 'CASH', customerOrPayer, notes } = body;

    const numAmount = Number(amount);
    if (!date || !source || !description || !numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'তারিখ, আয়ের উৎস, বিবরণ এবং টাকার পরিমাণ দিন' }, { status: 400 });
    }

    await connectToDatabase();

    const income = await Income.create({
      date,
      source,
      description: description.trim(),
      amount: numAmount,
      paymentMethod,
      customerOrPayer,
      notes,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'INCOME',
      recordId: income._id.toString(),
      details: `অন্যান্য আয় এন্ট্রি: ${source} - ৳${numAmount} (${description})`,
    });

    return NextResponse.json({ success: true, income }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'আয় সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
