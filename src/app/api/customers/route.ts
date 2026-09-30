import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    await connectToDatabase();
    const customers = await Customer.find().sort({ currentDue: -1, name: 1 }).lean();
    return NextResponse.json(customers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ক্রেতার তালিকা পেতে সমস্যা হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER', 'ACCOUNTANT'])) {
      return NextResponse.json(
        { error: 'নতুন ক্রেতা যুক্ত করার অনুমতি আপনার নেই' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, businessName, phone, address, openingBalance = 0, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'ক্রেতার নাম এবং মোবাইল নম্বর আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const openBal = Number(openingBalance) || 0;
    const customer = await Customer.create({
      name: name.trim(),
      businessName: businessName ? businessName.trim() : undefined,
      phone: phone.trim(),
      address: address ? address.trim() : undefined,
      openingBalance: openBal,
      currentDue: openBal,
      totalPurchases: 0,
      totalPaid: 0,
      notes,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'CUSTOMERS',
      recordId: customer._id.toString(),
      details: `নতুন ক্রেতা তৈরি হয়েছে: ${customer.name}, ফোন: ${customer.phone}, পূর্বের বকেয়া: ৳${openBal}`,
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ক্রেতা সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
