import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DailyEntry } from '@/models/DailyEntry';
import { Flock } from '@/models/Flock';
import { Shed } from '@/models/Shed';
import { EggInventory } from '@/models/EggInventory';
import { FeedItem } from '@/models/FeedItem';
import { MortalityRecord } from '@/models/MortalityRecord';
import { getCurrentUser } from '@/lib/auth';
import {
  calculateHenDayProduction,
  calculateFeedPerBird,
  calculateMortalityRate,
} from '@/lib/utils';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const flockId = searchParams.get('flockId');
    const date = searchParams.get('date');
    const limit = Number(searchParams.get('limit')) || 30;

    const query: any = {};
    if (flockId) query.flockId = flockId;
    if (date) query.date = date;

    const entries = await DailyEntry.find(query)
      .populate('flockId', 'name batchId breed')
      .populate('shedId', 'name code')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(entries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'দৈনিক এন্ট্রি তালিকা পেতে সমস্যা হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'অনুগ্রহ করে প্রথমে লগইন করুন' }, { status: 401 });
    }

    const body = await req.json();
    const {
      date,
      flockId,
      totalEggs = 0,
      goodEggs = 0,
      brokenEggs = 0,
      dirtyEggs = 0,
      rejectedEggs = 0,
      feedConsumedKg = 0,
      waterLiters = 0,
      mortalityCount = 0,
      culledCount = 0,
      feedItemId,
      temperatureCelsius,
      notes,
    } = body;

    if (!date || !flockId) {
      return NextResponse.json({ error: 'তারিখ এবং ফ্লক নির্বাচন আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();

    const flock = await Flock.findById(flockId);
    if (!flock || flock.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'সক্রিয় ফ্লক পাওয়া যায়নি' }, { status: 404 });
    }

    // Check duplicate daily entry for the flock on this date
    const existingEntry = await DailyEntry.findOne({ flockId: flock._id, date });
    if (existingEntry) {
      return NextResponse.json(
        {
          error: `এই ফ্লকের জন্য ${date} তারিখের এন্ট্রি ইতিমধ্যে রেকর্ড করা হয়েছে। ডুপ্লিকেট এন্ট্রি গ্রহণযোগ্য নয়।`,
        },
        { status: 400 }
      );
    }

    const openingBirdCount = flock.currentBirdCount;
    const numMortality = Number(mortalityCount) || 0;
    const numCulled = Number(culledCount) || 0;
    const numTotalEggs = Number(totalEggs) || 0;
    const numGoodEggs = Number(goodEggs) || 0;
    const numBroken = Number(brokenEggs) || 0;
    const numDirty = Number(dirtyEggs) || 0;
    const numRejected = Number(rejectedEggs) || 0;
    const numFeedKg = Number(feedConsumedKg) || 0;

    // Validate egg counts
    if (numGoodEggs + numBroken + numDirty + numRejected !== numTotalEggs && numTotalEggs > 0) {
      // If user only entered total eggs and good eggs wasn't broken down, default goodEggs = totalEggs - broken - dirty
      // Otherwise adjust gracefully
    }

    // Calculate closing birds
    const closingBirdCount = Math.max(0, openingBirdCount - numMortality - numCulled);

    // Poultry science formulas
    const eggProductionPercentage = calculateHenDayProduction(numTotalEggs, openingBirdCount);
    const mortalityPercentage = calculateMortalityRate(numMortality, openingBirdCount);
    const feedPerBirdGrams = calculateFeedPerBird(numFeedKg, openingBirdCount);

    const entry = await DailyEntry.create({
      date,
      shedId: flock.shedId,
      flockId: flock._id,
      openingBirdCount,
      totalEggs: numTotalEggs,
      goodEggs: numGoodEggs > 0 ? numGoodEggs : numTotalEggs - numBroken - numDirty,
      brokenEggs: numBroken,
      dirtyEggs: numDirty,
      rejectedEggs: numRejected,
      feedConsumedKg: numFeedKg,
      waterLiters: Number(waterLiters) || 0,
      mortalityCount: numMortality,
      culledCount: numCulled,
      closingBirdCount,
      eggProductionPercentage,
      mortalityPercentage,
      feedPerBirdGrams,
      temperatureCelsius: temperatureCelsius ? Number(temperatureCelsius) : undefined,
      notes,
      recordedByUid: user.uid,
      recordedByName: user.displayName,
    });

    // 1. UPDATE FLOCK POPULATION
    flock.currentBirdCount = closingBirdCount;
    await flock.save();

    // 2. UPDATE SHED OCCUPANCY
    const shed = await Shed.findById(flock.shedId);
    if (shed) {
      shed.currentOccupancy = closingBirdCount;
      await shed.save();
    }

    // 3. UPDATE EGG INVENTORY (Increase inventory)
    let eggStock = await EggInventory.findOne();
    if (!eggStock) {
      eggStock = await EggInventory.create({
        totalPieces: 0,
        goodPieces: 0,
        brokenPieces: 0,
        dirtyPieces: 0,
        lastUpdated: new Date(),
      });
    }

    eggStock.totalPieces += numTotalEggs;
    eggStock.goodPieces += entry.goodEggs;
    eggStock.brokenPieces += numBroken;
    eggStock.dirtyPieces += numDirty;
    eggStock.lastUpdated = new Date();
    await eggStock.save();

    // 4. UPDATE FEED INVENTORY (Decrease stock)
    if (numFeedKg > 0) {
      let feedItemDoc = null;
      if (feedItemId) {
        feedItemDoc = await FeedItem.findById(feedItemId);
      } else {
        feedItemDoc = await FeedItem.findOne({ currentStockKg: { $gt: 0 } }).sort({ currentStockKg: -1 });
      }

      if (feedItemDoc) {
        feedItemDoc.currentStockKg = Math.max(0, feedItemDoc.currentStockKg - numFeedKg);
        await feedItemDoc.save();
      }
    }

    // 5. RECORD MORTALITY IF ANY
    if (numMortality > 0) {
      await MortalityRecord.create({
        date,
        flockId: flock._id,
        flockName: flock.name,
        deadCount: numMortality,
        suspectedReason: notes || 'দৈনিক নিয়মিত রেকর্ড',
        recordedByUid: user.uid,
      });
    }

    // 6. RECORD AUDIT LOG
    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'DAILY_ENTRY',
      recordId: entry._id.toString(),
      details: `${flock.name} ফ্লকের দৈনিক এন্ট্রি সম্পন্ন: ডিম ${numTotalEggs}টি, খাদ্য ${numFeedKg} কেজি, মৃত্যু ${numMortality}টি`,
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: unknown) {
    console.error('Daily entry submission error:', error);
    const message = error instanceof Error ? error.message : 'দৈনিক এন্ট্রি সংরক্ষণ করতে সমস্যা হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
