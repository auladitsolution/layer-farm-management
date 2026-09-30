import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EggSale } from '@/models/EggSale';
import { EggInventory } from '@/models/EggInventory';
import { Customer } from '@/models/Customer';
import { Setting } from '@/models/Setting';
import { CustomerPayment } from '@/models/CustomerPayment';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 50;

    const sales = await EggSale.find()
      .populate('customerId', 'name phone address currentDue')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(sales);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'বিক্রয় চালান তালিকা পাওয়া যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER', 'ACCOUNTANT'])) {
      return NextResponse.json(
        { error: 'ডিম বিক্রয় চালান তৈরি করার অনুমতি আপনার নেই' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      customerId,
      date,
      unitType = 'TRAY',
      quantityInUnit,
      unitPrice,
      discount = 0,
      paidAmount = 0,
      paymentMethod = 'CASH',
      notes,
    } = body;

    const qty = Number(quantityInUnit);
    const price = Number(unitPrice);
    const disc = Number(discount) || 0;
    const paid = Number(paidAmount) || 0;

    if (!customerId || !date || !qty || qty <= 0 || !price || price <= 0) {
      return NextResponse.json(
        { error: 'ক্রেতা, তারিখ, বিক্রয়ের পরিমাণ এবং দর আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ error: 'ক্রেতা পাওয়া যায়নি' }, { status: 404 });
    }

    const settings = (await Setting.findOne()) || { traySize: 30 };
    const traySize = settings.traySize || 30;

    // Calculate total pieces
    let conversionRate = 1;
    if (unitType === 'TRAY') conversionRate = traySize;
    else if (unitType === 'DOZEN') conversionRate = 12;

    const totalPieces = Math.round(qty * conversionRate);

    // Check inventory
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

    if (eggStock.goodPieces < totalPieces) {
      return NextResponse.json(
        {
          error: `অপর্যাপ্ত ডিমের স্টক! স্টকে রয়েছে মাত্র ${eggStock.goodPieces}টি ভালো ডিম, কিন্তু বিক্রয় চালানে রয়েছে ${totalPieces}টি ডিম।`,
        },
        { status: 400 }
      );
    }

    // Precise financial calculations
    const subTotal = Math.round(qty * price * 100) / 100;
    const grandTotal = Math.max(0, Math.round((subTotal - disc) * 100) / 100);
    const dueAmount = Math.max(0, Math.round((grandTotal - paid) * 100) / 100);

    const invoiceCount = await EggSale.countDocuments();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    const sale = await EggSale.create({
      invoiceNo,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      date,
      unitType,
      quantityInUnit: qty,
      conversionRateToPieces: conversionRate,
      totalPieces,
      unitPrice: price,
      subTotal,
      discount: disc,
      grandTotal,
      paidAmount: paid,
      dueAmount,
      paymentMethod,
      notes,
      recordedByUid: user.uid,
      recordedByName: user.displayName,
    });

    // Deduct Egg Inventory
    eggStock.goodPieces = Math.max(0, eggStock.goodPieces - totalPieces);
    eggStock.totalPieces = Math.max(0, eggStock.totalPieces - totalPieces);
    eggStock.lastUpdated = new Date();
    await eggStock.save();

    // Update Customer Due & Purchases
    customer.totalPurchases += grandTotal;
    customer.totalPaid += paid;
    customer.currentDue += dueAmount;
    await customer.save();

    // If paidAmount > 0, generate customer payment record
    if (paid > 0) {
      await CustomerPayment.create({
        receiptNo: `REC-INV-${sale.invoiceNo}`,
        customerId: customer._id,
        customerName: customer.name,
        date,
        amount: paid,
        paymentMethod,
        transactionRef: `চালান: ${invoiceNo}`,
        notes: 'চালান কাটার সময় নগদ আদায়',
        receivedByUid: user.uid,
        receivedByName: user.displayName,
      });
    }

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'EGG_SALES',
      recordId: sale._id.toString(),
      details: `ডিম বিক্রয় চালান তৈরি: ${invoiceNo}, ক্রেতা: ${customer.name}, পরিমাণ: ${qty} ${unitType}, মোট: ৳${grandTotal}, পরিশোধ: ৳${paid}, বকেয়া: ৳${dueAmount}`,
    });

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error: unknown) {
    console.error('Egg sale error:', error);
    const message = error instanceof Error ? error.message : 'ডিম বিক্রয় চালান তৈরি ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
