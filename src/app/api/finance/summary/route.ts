import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Expense } from '@/models/Expense';
import { Income } from '@/models/Income';
import { EggSale } from '@/models/EggSale';
import { CustomerPayment } from '@/models/CustomerPayment';
import { Customer } from '@/models/Customer';
import { Supplier } from '@/models/Supplier';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().substring(0, 7); // e.g. "2026-09"
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Monthly Egg Sales
    const eggSales = await EggSale.find({ date: { $regex: `^${month}` } }).lean();
    const totalEggSales = eggSales.reduce((s, x) => s + (x.grandTotal || 0), 0);
    const totalEggCashReceived = eggSales.reduce((s, x) => s + (x.paidAmount || 0), 0);

    // 2. Monthly Other Income
    const otherIncomes = await Income.find({ date: { $regex: `^${month}` } }).lean();
    const totalOtherIncome = otherIncomes.reduce((s, x) => s + (x.amount || 0), 0);

    // 3. Monthly Expenses Breakdown
    const expenses = await Expense.find({ date: { $regex: `^${month}` } }).lean();
    const totalExpenses = expenses.reduce((s, x) => s + (x.amount || 0), 0);

    const expenseCategoryMap: Record<string, number> = {};
    for (const exp of expenses) {
      expenseCategoryMap[exp.category] = (expenseCategoryMap[exp.category] || 0) + exp.amount;
    }

    // 4. Receivables & Payables
    const customers = await Customer.find().lean();
    const totalReceivables = customers.reduce((s, c) => s + Math.max(0, c.currentDue || 0), 0);

    const suppliers = await Supplier.find().lean();
    const totalPayables = suppliers.reduce((s, sup) => s + Math.max(0, sup.currentPayable || 0), 0);

    // 5. Today's Cash Flow
    const todaySales = await EggSale.find({ date: todayStr });
    const todayPayments = await CustomerPayment.find({ date: todayStr });
    const todayExpenses = await Expense.find({ date: todayStr });
    const todayOtherIncome = await Income.find({ date: todayStr });

    const todayCashIn =
      todaySales.reduce((s, x) => s + (x.paidAmount || 0), 0) +
      todayPayments.reduce((s, x) => s + (x.amount || 0), 0) +
      todayOtherIncome.reduce((s, x) => s + (x.amount || 0), 0);

    const todayCashOut = todayExpenses.reduce((s, x) => s + (x.amount || 0), 0);

    const netProfit = totalEggSales + totalOtherIncome - totalExpenses;

    return NextResponse.json({
      month,
      income: {
        eggSales: totalEggSales,
        otherIncome: totalOtherIncome,
        totalIncome: totalEggSales + totalOtherIncome,
        cashReceived: totalEggCashReceived,
      },
      expense: {
        totalExpense: totalExpenses,
        breakdown: expenseCategoryMap,
      },
      netProfit,
      receivables: totalReceivables,
      payables: totalPayables,
      todayCash: {
        cashIn: todayCashIn,
        cashOut: todayCashOut,
        netCash: todayCashIn - todayCashOut,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'আর্থিক বিবরণী লোড ব্যর্থ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
