import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EggInventory } from '@/models/EggInventory';
import { Setting } from '@/models/Setting';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    await connectToDatabase();
    let inventory = await EggInventory.findOne();
    if (!inventory) {
      inventory = await EggInventory.create({
        totalPieces: 0,
        goodPieces: 0,
        brokenPieces: 0,
        dirtyPieces: 0,
        lastUpdated: new Date(),
      });
    }

    const settings = (await Setting.findOne()) || { traySize: 30 };
    const traySize = settings.traySize || 30;

    return NextResponse.json({
      inventory,
      traySize,
      trays: Math.floor(inventory.goodPieces / traySize),
      remainingPieces: inventory.goodPieces % traySize,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ডিমের স্টক লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER'])) {
      return NextResponse.json(
        { error: 'ডিম স্টক সমন্বয় করার অনুমতি আপনার নেই' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { totalPieces, goodPieces, brokenPieces, dirtyPieces, reason } = body;

    if (totalPieces === undefined || !reason) {
      return NextResponse.json(
        { error: 'সমন্বয়ের সংখ্যা এবং সুনির্দিষ্ট কারণ উল্লেখ আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    let inventory = await EggInventory.findOne();
    if (!inventory) {
      inventory = new EggInventory({});
    }

    const prevGood = inventory.goodPieces;
    inventory.totalPieces = Number(totalPieces);
    inventory.goodPieces = Number(goodPieces);
    inventory.brokenPieces = Number(brokenPieces) || 0;
    inventory.dirtyPieces = Number(dirtyPieces) || 0;
    inventory.lastUpdated = new Date();
    await inventory.save();

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'ADJUSTMENT',
      module: 'EGG_INVENTORY',
      recordId: inventory._id.toString(),
      details: `ডিম স্টক সমন্বয়: পূর্বের ভালো ডিম ${prevGood}টি -> বর্তমান ${inventory.goodPieces}টি। কারণ: ${reason}`,
    });

    return NextResponse.json({ success: true, inventory });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'স্টক সমন্বয় ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
