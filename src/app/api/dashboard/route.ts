import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Shed } from '@/models/Shed';
import { Flock } from '@/models/Flock';
import { DailyEntry } from '@/models/DailyEntry';
import { EggInventory } from '@/models/EggInventory';
import { FeedItem } from '@/models/FeedItem';
import { EggSale } from '@/models/EggSale';
import { Customer } from '@/models/Customer';
import { Supplier } from '@/models/Supplier';
import { Expense } from '@/models/Expense';
import { Income } from '@/models/Income';
import { Setting } from '@/models/Setting';
import { Notification } from '@/models/Notification';

export async function GET() {
  try {
    await connectToDatabase();

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-09"

    // 1. Farm & Flock Overview
    const totalSheds = await Shed.countDocuments();
    const activeFlocks = await Flock.find({ status: 'ACTIVE' });
    const currentBirdPopulation = activeFlocks.reduce((sum, f) => sum + (f.currentBirdCount || 0), 0);

    // 2. Today's Production Entries
    const todayEntries = await DailyEntry.find({ date: todayStr });
    const todayEggs = todayEntries.reduce((sum, e) => sum + (e.totalEggs || 0), 0);
    const todayGoodEggs = todayEntries.reduce((sum, e) => sum + (e.goodEggs || 0), 0);
    const todayBrokenEggs = todayEntries.reduce((sum, e) => sum + (e.brokenEggs || 0) + (e.dirtyEggs || 0), 0);
    const todayFeedKg = todayEntries.reduce((sum, e) => sum + (e.feedConsumedKg || 0), 0);
    const todayMortality = todayEntries.reduce((sum, e) => sum + (e.mortalityCount || 0), 0);

    // 3. Current Stocks
    const eggInventory = (await EggInventory.findOne()) || {
      totalPieces: 0,
      goodPieces: 0,
      brokenPieces: 0,
    };
    const feedItems = await FeedItem.find();
    const currentFeedStockKg = feedItems.reduce((sum, f) => sum + (f.currentStockKg || 0), 0);

    // 4. Financial Summary
    // Today's Sales
    const todaySales = await EggSale.find({ date: todayStr });
    const todaySalesAmount = todaySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

    // Today's Expenses
    const todayExpenses = await Expense.find({ date: todayStr });
    const todayExpenseAmount = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Monthly Income & Expense
    const monthlySales = await EggSale.find({ date: { $regex: `^${currentMonthPrefix}` } });
    const monthlySalesTotal = monthlySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

    const monthlyOtherIncome = await Income.find({ date: { $regex: `^${currentMonthPrefix}` } });
    const monthlyOtherIncomeTotal = monthlyOtherIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalMonthlyIncome = monthlySalesTotal + monthlyOtherIncomeTotal;

    const monthlyExpenses = await Expense.find({ date: { $regex: `^${currentMonthPrefix}` } });
    const totalMonthlyExpense = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const estimatedNetProfit = totalMonthlyIncome - totalMonthlyExpense;

    // Receivables & Payables
    const customers = await Customer.find();
    const customerReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.currentDue || 0), 0);

    const suppliers = await Supplier.find();
    const supplierPayables = suppliers.reduce((sum, s) => sum + Math.max(0, s.currentPayable || 0), 0);

    // 5. 7-Day Trend for Recharts
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const pastEntries = await DailyEntry.find({ date: { $in: last7Days } });

    const chartData = last7Days.map((day) => {
      const dayRecords = pastEntries.filter((e) => e.date === day);
      const totalEggsDay = dayRecords.reduce((sum, e) => sum + (e.totalEggs || 0), 0);
      const feedKgDay = dayRecords.reduce((sum, e) => sum + (e.feedConsumedKg || 0), 0);
      const mortalityDay = dayRecords.reduce((sum, e) => sum + (e.mortalityCount || 0), 0);
      const dateParts = day.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}`;

      return {
        date: formattedDate,
        fullDate: day,
        eggs: totalEggsDay,
        feedKg: feedKgDay,
        mortality: mortalityDay,
      };
    });

    // 6. Active Alerts & Settings
    const settingsDoc = await Setting.findOne();
    const settings = settingsDoc || {
      farmName: 'বিসমিল্লাহ লেয়ার ফার্ম',
      traySize: 30,
      lowFeedThresholdKg: 200,
      highMortalityThresholdPercent: 1.5,
    };
    const notifications = await Notification.find({ isRead: false }).sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      overview: {
        totalBirds: currentBirdPopulation,
        totalSheds,
        activeBatches: activeFlocks.length,
        todayEggs,
        todayGoodEggs,
        todayBrokenEggs,
        todayFeedKg,
        todayMortality,
        currentFeedStockKg,
        currentEggStock: eggInventory.totalPieces,
      },
      finance: {
        todaySales: todaySalesAmount,
        todayExpenses: todayExpenseAmount,
        monthlyIncome: totalMonthlyIncome,
        monthlyExpense: totalMonthlyExpense,
        estimatedProfit: estimatedNetProfit,
        customerReceivables,
        supplierPayables,
      },
      chartData,
      notifications,
      settings: {
        farmName: settings.farmName || 'বিসমিল্লাহ লেয়ার ফার্ম',
        traySize: settings.traySize || 30,
      },
    });
  } catch (error: unknown) {
    console.error('Dashboard data aggregation error:', error);
    const message = error instanceof Error ? error.message : 'ড্যাশবোর্ড তথ্য লোড করা সম্ভব হয়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
