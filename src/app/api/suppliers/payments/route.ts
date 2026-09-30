import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Supplier } from '@/models/Supplier';
import { SupplierPayment } from '@/models/SupplierPayment';
import { Expense } from '@/models/Expense';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'ACCOUNTANT'])) {
      return NextResponse.json({ error: 'সরবরাহকারীকে দেনা পরিশোধের অনুমতি নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { supplierId, amount, paymentMethod = 'CASH', transactionRef, notes } = body;

    const payAmount = Number(amount);
    if (!supplierId || !payAmount || payAmount <= 0) {
      return NextResponse.json({ error: 'সরবরাহকারী ও সঠিক টাকার পরিমাণ দিন' }, { status: 400 });
    }

    await connectToDatabase();

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return NextResponse.json({ error: 'সরবরাহকারী পাওয়া যায়নি' }, { status: 404 });

    const voucherNo = `VOUCH-${Date.now().toString().slice(-6)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const payment = await SupplierPayment.create({
      voucherNo,
      supplierId: supplier._id,
      supplierName: supplier.name,
      date: todayStr,
      amount: payAmount,
      paymentMethod,
      transactionRef,
      notes,
      paidByUid: user.uid,
      paidByName: user.displayName,
    });

    // Update supplier balance
    supplier.currentPayable = Math.max(0, supplier.currentPayable - payAmount);
    supplier.totalPaid += payAmount;
    await supplier.save();

    // Create Expense entry
    await Expense.create({
      date: todayStr,
      category: supplier.category || 'FEED',
      description: `সরবরাহকারীকে বকেয়া পরিশোধ - ${supplier.name} (ভাউচার: ${voucherNo})`,
      amount: payAmount,
      paymentMethod,
      supplierOrPayee: supplier.name,
      notes,
      recordedByUid: user.uid,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'SUPPLIER_PAYMENTS',
      recordId: payment._id.toString(),
      details: `${supplier.name} কে ৳${payAmount} দেনা পরিশোধ করা হয়েছে (${paymentMethod}, ভাউচার: ${voucherNo})`,
    });

    return NextResponse.json({ success: true, payment, updatedPayable: supplier.currentPayable });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'দেনা পরিশোধ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
