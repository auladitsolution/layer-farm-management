import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Employee } from '@/models/Employee';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    await connectToDatabase();
    let employees = await Employee.find().sort({ status: 1, name: 1 }).lean();

    if (employees.length === 0) {
      await Employee.create([
        {
          name: 'কামাল উদ্দিন',
          phone: '01811-223344',
          role: 'শেড সুপারভাইজার / কেয়ারটেকার',
          monthlySalary: 18000,
          joiningDate: '2024-01-15',
          address: 'গাজীপুর সদর',
          status: 'ACTIVE',
        },
        {
          name: 'জাহাঙ্গীর আলম',
          phone: '01822-334455',
          role: 'খাদ্য ও ডিম সংগ্রহ কর্মী',
          monthlySalary: 14000,
          joiningDate: '2024-06-01',
          address: 'কালিয়াকৈর, গাজীপুর',
          status: 'ACTIVE',
        },
      ]);
      employees = await Employee.find().sort({ status: 1, name: 1 }).lean();
    }

    return NextResponse.json(employees);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'কর্মী তালিকা লোড করা যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER'])) {
      return NextResponse.json({ error: 'কর্মী যুক্ত করার অনুমতি আপনার নেই' }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, role, monthlySalary = 0, joiningDate, address, status = 'ACTIVE' } = body;

    if (!name || !phone || !role || !joiningDate) {
      return NextResponse.json({ error: 'সকল আবশ্যক তথ্য পূরণ করুন' }, { status: 400 });
    }

    await connectToDatabase();

    const employee = await Employee.create({
      name: name.trim(),
      phone: phone.trim(),
      role: role.trim(),
      monthlySalary: Number(monthlySalary) || 0,
      joiningDate,
      address: address ? address.trim() : undefined,
      status,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'EMPLOYEES',
      recordId: employee._id.toString(),
      details: `নতুন কর্মী যুক্ত করা হয়েছে: ${employee.name} (${employee.role}, বেতন: ৳${employee.monthlySalary})`,
    });

    return NextResponse.json({ success: true, employee }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'কর্মী সংরক্ষণ ব্যর্থ হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
