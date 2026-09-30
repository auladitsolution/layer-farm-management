import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FeedItem } from '@/models/FeedItem';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    await connectToDatabase();
    let feeds = await FeedItem.find().sort({ currentStockKg: 1 }).lean();

    // Default starter feed records if empty
    if (feeds.length === 0) {
      await FeedItem.create([
        {
          name: 'লেয়ার লেয়ার-১ ফিড (ডিম পাড়া মুরগি)',
          type: 'LAYER_1',
          brand: 'নারিশ পোল্ট্রি ফিড',
          unit: 'কেজি',
          bagWeightKg: 50,
          currentStockKg: 1200,
          lowStockThresholdKg: 300,
          averagePurchasePricePerKg: 62,
        },
        {
          name: 'লেয়ার লেয়ার-২ ফিড',
          type: 'LAYER_2',
          brand: 'সিপি ফিড বাংলাদেশ',
          unit: 'কেজি',
          bagWeightKg: 50,
          currentStockKg: 850,
          lowStockThresholdKg: 250,
          averagePurchasePricePerKg: 60,
        },
      ]);
      feeds = await FeedItem.find().sort({ currentStockKg: 1 }).lean();
    }

    return NextResponse.json(feeds);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'খাদ্য তালিকা পেতে সমস্যা হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER', 'INVENTORY_MANAGER'])) {
      return NextResponse.json({ error: 'খাদ্যের ধরন যোগ করার অনুমতি আপনার নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { name, type = 'LAYER_1', brand, unit = 'কেজি', bagWeightKg = 50, lowStockThresholdKg = 200, notes } = body;

    if (!name || !brand) {
      return NextResponse.json({ error: 'খাদ্যের নাম এবং ব্র্যান্ড আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();

    const feed = await FeedItem.create({
      name: name.trim(),
      type,
      brand: brand.trim(),
      unit,
      bagWeightKg: Number(bagWeightKg) || 50,
      currentStockKg: 0,
      lowStockThresholdKg: Number(lowStockThresholdKg) || 200,
      averagePurchasePricePerKg: 0,
      notes,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'FEED_INVENTORY',
      recordId: feed._id.toString(),
      details: `নতুন খাদ্য আইটেম যুক্ত করা হয়েছে: ${feed.name} (${feed.brand})`,
    });

    return NextResponse.json({ success: true, feed }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'খাদ্য সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
