import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { CustomerPayment } from '@/models/CustomerPayment';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'ACCOUNTANT'])) {
      return NextResponse.json(
        { error: 'টাকা আদায় বা পেমেন্ট এন্ট্রি করার অনুমতি আপনার নেই' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { customerId, amount, paymentMethod = 'CASH', transactionRef, notes } = body;

    const payAmount = Number(amount);
    if (!customerId || !payAmount || payAmount <= 0) {
      return NextResponse.json(
        { error: 'ক্রেতা এবং সঠিক টাকার পরিমাণ প্রদান করুন' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ error: 'ক্রেতা পাওয়া যায়নি' }, { status: 404 });
    }

    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const payment = await CustomerPayment.create({
      receiptNo,
      customerId: customer._id,
      customerName: customer.name,
      date: todayStr,
      amount: payAmount,
      paymentMethod,
      transactionRef,
      notes,
      receivedByUid: user.uid,
      receivedByName: user.displayName,
    });

    // Update customer balances accurately
    customer.currentDue -= payAmount;
    customer.totalPaid += payAmount;
    await customer.save();

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'PAYMENTS',
      recordId: payment._id.toString(),
      details: `${customer.name} এর কাছ থেকে ৳${payAmount} আদায় করা হয়েছে (${paymentMethod}, রশিদ: ${receiptNo})`,
    });

    return NextResponse.json({ success: true, payment, updatedDue: customer.currentDue });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'পেমেন্ট গ্রহণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
