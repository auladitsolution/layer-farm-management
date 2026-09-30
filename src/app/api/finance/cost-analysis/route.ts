import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DailyEntry } from '@/models/DailyEntry';
import { Expense } from '@/models/Expense';
import { EggSale } from '@/models/EggSale';
import { Setting } from '@/models/Setting';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().substring(0, 7); // e.g. "2026-09"
    const flockId = searchParams.get('flockId');

    const entryQuery: any = { date: { $regex: `^${month}` } };
    if (flockId) entryQuery.flockId = flockId;

    const dailyEntries = await DailyEntry.find(entryQuery).lean();
    const totalEggsProduced = dailyEntries.reduce((s, e) => s + (e.totalEggs || 0), 0);
    const totalGoodEggs = dailyEntries.reduce((s, e) => s + (e.goodEggs || 0), 0);
    const totalFeedKgUsed = dailyEntries.reduce((s, e) => s + (e.feedConsumedKg || 0), 0);

    // Get expenses during this month
    const expenses = await Expense.find({ date: { $regex: `^${month}` } }).lean();

    let feedCost = 0;
    let medicineCost = 0;
    let utilityCost = 0; // electricity + water + gas
    let labourCost = 0; // labour + salary
    let otherCost = 0;

    for (const exp of expenses) {
      if (exp.category === 'FEED') {
        feedCost += exp.amount;
      } else if (exp.category === 'MEDICINE' || exp.category === 'VACCINE' || exp.category === 'VETERINARY') {
        medicineCost += exp.amount;
      } else if (exp.category === 'ELECTRICITY' || exp.category === 'WATER' || exp.category === 'GAS') {
        utilityCost += exp.amount;
      } else if (exp.category === 'LABOUR' || exp.category === 'SALARY') {
        labourCost += exp.amount;
      } else {
        otherCost += exp.amount;
      }
    }

    const totalOperatingCost = feedCost + medicineCost + utilityCost + labourCost + otherCost;

    const settings = (await Setting.findOne()) || { traySize: 30 };
    const traySize = settings.traySize || 30;

    // Scientifically sound per-egg costs
    const costPerEgg = totalEggsProduced > 0 ? totalOperatingCost / totalEggsProduced : 0;
    const costPerDozen = costPerEgg * 12;
    const costPerTray = costPerEgg * traySize;

    // Average selling price this month
    const sales = await EggSale.find({ date: { $regex: `^${month}` } }).lean();
    const totalSalesRevenue = sales.reduce((s, x) => s + (x.grandTotal || 0), 0);
    const totalSalesPieces = sales.reduce((s, x) => s + (x.totalPieces || 0), 0);

    const avgSellingPricePerEgg = totalSalesPieces > 0 ? totalSalesRevenue / totalSalesPieces : 10.5;
    const avgSellingPricePerTray = avgSellingPricePerEgg * traySize;

    const netMarginPerEgg = avgSellingPricePerEgg - costPerEgg;
    const netMarginPerTray = avgSellingPricePerTray - costPerTray;

    return NextResponse.json({
      period: month,
      traySize,
      production: {
        totalEggsProduced,
        totalGoodEggs,
        totalFeedKgUsed,
      },
      costs: {
        feedCost,
        medicineCost,
        utilityCost,
        labourCost,
        otherCost,
        totalOperatingCost,
      },
      analysis: {
        costPerEgg: Number(costPerEgg.toFixed(2)),
        costPerDozen: Number(costPerDozen.toFixed(2)),
        costPerTray: Number(costPerTray.toFixed(2)),
        avgSellingPricePerEgg: Number(avgSellingPricePerEgg.toFixed(2)),
        avgSellingPricePerTray: Number(avgSellingPricePerTray.toFixed(2)),
        netMarginPerEgg: Number(netMarginPerEgg.toFixed(2)),
        netMarginPerTray: Number(netMarginPerTray.toFixed(2)),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'উৎপাদন খরচ বিশ্লেষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
