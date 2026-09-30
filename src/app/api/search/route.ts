import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Flock } from '@/models/Flock';
import { Customer } from '@/models/Customer';
import { Supplier } from '@/models/Supplier';
import { EggSale } from '@/models/EggSale';
import { FeedPurchase } from '@/models/FeedPurchase';
import { Employee } from '@/models/Employee';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json({
        flocks: [],
        customers: [],
        suppliers: [],
        sales: [],
        purchases: [],
        employees: [],
      });
    }

    await connectToDatabase();
    const regex = new RegExp(query, 'i');

    const [flocks, customers, suppliers, sales, purchases, employees] = await Promise.all([
      Flock.find({ $or: [{ name: regex }, { batchId: regex }, { breed: regex }] }).limit(5).lean(),
      Customer.find({ $or: [{ name: regex }, { phone: regex }, { businessName: regex }] }).limit(5).lean(),
      Supplier.find({ $or: [{ name: regex }, { phone: regex }, { companyName: regex }] }).limit(5).lean(),
      EggSale.find({ $or: [{ invoiceNo: regex }, { customerName: regex }] }).limit(5).lean(),
      FeedPurchase.find({ $or: [{ invoiceNo: regex }, { feedName: regex }, { supplierName: regex }] }).limit(5).lean(),
      Employee.find({ $or: [{ name: regex }, { phone: regex }, { role: regex }] }).limit(5).lean(),
    ]);

    return NextResponse.json({
      flocks,
      customers,
      suppliers,
      sales,
      purchases,
      employees,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'অনুসন্ধান প্রক্রিয়া ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
