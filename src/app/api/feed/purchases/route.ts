import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FeedPurchase } from '@/models/FeedPurchase';
import { FeedItem } from '@/models/FeedItem';
import { Supplier } from '@/models/Supplier';
import { Expense } from '@/models/Expense';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const purchases = await FeedPurchase.find()
      .populate('supplierId', 'name phone')
      .populate('feedItemId', 'name brand')
      .sort({ date: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(purchases);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'খাদ্য ক্রয়ের রেকর্ড পাওয়া যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER', 'INVENTORY_MANAGER', 'ACCOUNTANT'])) {
      return NextResponse.json({ error: 'খাদ্য ক্রয়ের চালান এন্ট্রি করার অনুমতি নেই' }, { status: 403 });
    }

    const body = await req.json();
    const {
      supplierId,
      feedItemId,
      date,
      bagCount,
      pricePerKg,
      transportCost = 0,
      discount = 0,
      paidAmount = 0,
      paymentMethod = 'CASH',
      notes,
    } = body;

    const bags = Number(bagCount);
    const price = Number(pricePerKg);
    const transport = Number(transportCost) || 0;
    const disc = Number(discount) || 0;
    const paid = Number(paidAmount) || 0;

    if (!supplierId || !feedItemId || !date || !bags || bags <= 0 || !price || price <= 0) {
      return NextResponse.json({ error: 'সকল আবশ্যক তথ্য পূরণ করুন' }, { status: 400 });
    }

    await connectToDatabase();

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return NextResponse.json({ error: 'সরবরাহকারী পাওয়া যায়নি' }, { status: 404 });

    const feedItem = await FeedItem.findById(feedItemId);
    if (!feedItem) return NextResponse.json({ error: 'খাদ্যের আইটেম পাওয়া যায়নি' }, { status: 404 });

    const totalKg = bags * (feedItem.bagWeightKg || 50);
    const subTotal = Math.round(totalKg * price * 100) / 100;
    const totalCost = Math.max(0, Math.round((subTotal + transport - disc) * 100) / 100);
    const dueAmount = Math.max(0, Math.round((totalCost - paid) * 100) / 100);

    const invoiceCount = await FeedPurchase.countDocuments();
    const invoiceNo = `FEED-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const purchase = await FeedPurchase.create({
      invoiceNo,
      supplierId: supplier._id,
      supplierName: supplier.name,
      feedItemId: feedItem._id,
      feedName: feedItem.name,
      date,
      bagCount: bags,
      totalKg,
      pricePerKg: price,
      subTotal,
      transportCost: transport,
      discount: disc,
      totalCost,
      paidAmount: paid,
      dueAmount,
      paymentMethod,
      notes,
    });

    // 1. UPDATE FEED STOCK (Increase inventory)
    feedItem.currentStockKg += totalKg;
    feedItem.averagePurchasePricePerKg = price;
    await feedItem.save();

    // 2. UPDATE SUPPLIER BALANCES
    supplier.totalPurchases += totalCost;
    supplier.totalPaid += paid;
    supplier.currentPayable += dueAmount;
    await supplier.save();

    // 3. CREATE EXPENSE RECORD IF PAID (Avoid double count)
    if (paid > 0) {
      await Expense.create({
        date,
        category: 'FEED',
        description: `খাদ্য ক্রয় বিল পরিশোধ - চালান: ${invoiceNo} (${feedItem.name}, ${bags} বস্তা)`,
        amount: paid,
        paymentMethod,
        supplierOrPayee: supplier.name,
        notes: `বকেয়া রয়েছে ৳${dueAmount}`,
        recordedByUid: user.uid,
      });
    }

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'FEED_PURCHASE',
      recordId: purchase._id.toString(),
      details: `খাদ্য ক্রয় চালান: ${invoiceNo}, খাদ্য: ${feedItem.name}, পরিমাণ: ${totalKg} কেজি (${bags} বস্তা), মোট: ৳${totalCost}, পরিশোধ: ৳${paid}, দেনা: ৳${dueAmount}`,
    });

    return NextResponse.json({ success: true, purchase }, { status: 201 });
  } catch (error: unknown) {
    console.error('Feed purchase error:', error);
    const message = error instanceof Error ? error.message : 'খাদ্য ক্রয় সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
