import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Expense } from '@/models/Expense';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const month = searchParams.get('month'); // YYYY-MM

    const query: any = {};
    if (category) query.category = category;
    if (month) query.date = { $regex: `^${month}` };

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 }).limit(100).lean();
    return NextResponse.json(expenses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'খরচ তালিকা লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'ACCOUNTANT'])) {
      return NextResponse.json({ error: 'খরচ এন্ট্রি করার অনুমতি নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { date, category, description, amount, paymentMethod = 'CASH', supplierOrPayee, receiptUrl, notes } = body;

    const numAmount = Number(amount);
    if (!date || !category || !description || !numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'তারিখ, ক্যাটাগরি, বিবরণ এবং সঠিক টাকার পরিমাণ আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();

    const expense = await Expense.create({
      date,
      category,
      description: description.trim(),
      amount: numAmount,
      paymentMethod,
      supplierOrPayee,
      receiptUrl,
      notes,
      recordedByUid: user.uid,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'EXPENSES',
      recordId: expense._id.toString(),
      details: `নতুন খরচ এন্ট্রি: ${category} - ৳${numAmount} (${description})`,
    });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'খরচ সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
