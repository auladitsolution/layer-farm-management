import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Medicine } from '@/models/Medicine';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    await connectToDatabase();
    let medicines = await Medicine.find().sort({ currentStock: 1, name: 1 }).lean();

    if (medicines.length === 0) {
      await Medicine.create([
        {
          name: 'রানীক্ষেত ও আইবি লাইভ ভ্যাকসিন (ND + IB)',
          type: 'VACCINE',
          brand: 'ইন্টারভেট (Intervet)',
          unit: 'ভায়াল',
          currentStock: 15,
          lowStockThreshold: 5,
          expiryDate: '2027-04-30',
        },
        {
          name: 'গামবোরো ভ্যাকসিন (IBD Intermediate Plus)',
          type: 'VACCINE',
          brand: 'সেভা (Ceva)',
          unit: 'ভায়াল',
          currentStock: 10,
          lowStockThreshold: 4,
          expiryDate: '2027-02-15',
        },
        {
          name: 'ইলেক্ট্রোলাইট ও মাল্টিভিটামিন পাউডার (Electrolyte + Vit)',
          type: 'VITAMIN',
          brand: 'রেনাটা লিমিটেড',
          unit: 'প্যাকেট (১০০ গ্রাম)',
          currentStock: 40,
          lowStockThreshold: 10,
          expiryDate: '2027-08-20',
        },
      ]);
      medicines = await Medicine.find().sort({ currentStock: 1, name: 1 }).lean();
    }

    return NextResponse.json(medicines);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ওষুধ তালিকা লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER', 'INVENTORY_MANAGER'])) {
      return NextResponse.json({ error: 'ওষুধ যুক্ত করার অনুমতি আপনার নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { name, type = 'VACCINE', brand, unit = 'ভায়াল', currentStock = 0, lowStockThreshold = 5, expiryDate, notes } = body;

    if (!name || !brand) {
      return NextResponse.json({ error: 'ওষুধের নাম এবং প্রস্তুতকারক ব্র্যান্ড আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();

    const medicine = await Medicine.create({
      name: name.trim(),
      type,
      brand: brand.trim(),
      unit,
      currentStock: Number(currentStock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      expiryDate,
      notes,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'MEDICINE_INVENTORY',
      recordId: medicine._id.toString(),
      details: `নতুন ওষুধ/ভ্যাকসিন যুক্ত করা হয়েছে: ${medicine.name} (${medicine.type})`,
    });

    return NextResponse.json({ success: true, medicine }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ওষুধ সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
