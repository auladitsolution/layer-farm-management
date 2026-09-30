import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Supplier } from '@/models/Supplier';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    await connectToDatabase();
    let suppliers = await Supplier.find().sort({ currentPayable: -1, name: 1 }).lean();

    if (suppliers.length === 0) {
      await Supplier.create([
        {
          name: 'নারিশ ফিড ডিলার্স অ্যান্ড সাপ্লায়ার্স',
          companyName: 'নারিশ পোল্ট্রি ফিড লিঃ',
          phone: '01712-345678',
          address: 'শ্রীপুর, গাজীপুর',
          category: 'FEED',
          openingBalance: 0,
          currentPayable: 25000,
          totalPurchases: 150000,
          totalPaid: 125000,
        },
        {
          name: 'স্কয়ার এনিম্যাল হেলথ ও মেডিসিন',
          companyName: 'স্কয়ার ফার্মাসিউটিক্যালস লিঃ',
          phone: '01713-987654',
          address: 'টঙ্গী, গাজীপুর',
          category: 'MEDICINE',
          openingBalance: 0,
          currentPayable: 8000,
          totalPurchases: 45000,
          totalPaid: 37000,
        },
      ]);
      suppliers = await Supplier.find().sort({ currentPayable: -1, name: 1 }).lean();
    }

    return NextResponse.json(suppliers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সরবরাহকারী তালিকা লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER', 'ACCOUNTANT'])) {
      return NextResponse.json({ error: 'সরবরাহকারী যোগ করার অনুমতি আপনার নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { name, companyName, phone, address, category = 'FEED', openingBalance = 0, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'সরবরাহকারীর নাম এবং ফোন নম্বর আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();

    const openBal = Number(openingBalance) || 0;
    const supplier = await Supplier.create({
      name: name.trim(),
      companyName: companyName ? companyName.trim() : undefined,
      phone: phone.trim(),
      address: address ? address.trim() : undefined,
      category,
      openingBalance: openBal,
      currentPayable: openBal,
      totalPurchases: 0,
      totalPaid: 0,
      notes,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'SUPPLIERS',
      recordId: supplier._id.toString(),
      details: `নতুন সরবরাহকারী তৈরি: ${supplier.name} (${supplier.category}), পূর্বের দেনা: ৳${openBal}`,
    });

    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সরবরাহকারী সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
