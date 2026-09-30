import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Flock } from '@/models/Flock';
import { Shed } from '@/models/Shed';
import { Expense } from '@/models/Expense';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { calculateFlockAge } from '@/lib/utils';
import { AuditLog } from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const flocks = await Flock.find(query).populate('shedId', 'name code capacity').sort({ arrivalDate: -1 }).lean();

    const flocksWithDetails = flocks.map((flock: any) => {
      const age = calculateFlockAge(flock.arrivalDate, flock.ageInWeeksAtArrival);
      return {
        ...flock,
        ageInWeeks: age.weeks,
        ageDays: age.days,
        ageText: age.text,
        shedName: flock.shedId?.name || 'অনির্ধারিত',
        shedCode: flock.shedId?.code || '',
      };
    });

    return NextResponse.json(flocksWithDetails);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ফ্লক তথ্য লোড করতে ব্যর্থ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER'])) {
      return NextResponse.json(
        { error: 'নতুন ফ্লক/ব্যাচ তৈরির অনুমতি আপনার নেই' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      batchId,
      name,
      breed,
      supplier,
      shedId,
      arrivalDate,
      ageInWeeksAtArrival,
      initialBirdCount,
      purchaseCostPerBird = 0,
      notes,
    } = body;

    if (!batchId || !name || !breed || !shedId || !arrivalDate || !initialBirdCount) {
      return NextResponse.json(
        { error: 'সকল আবশ্যক তথ্য পূরণ করুন' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Flock.findOne({ batchId: batchId.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: 'এই ব্যাচ আইডির একটি ফ্লক ইতিমধ্যে বিদ্যমান' },
        { status: 400 }
      );
    }

    const shed = await Shed.findById(shedId);
    if (!shed) {
      return NextResponse.json({ error: 'নির্বাচিত শেড পাওয়া যায়নি' }, { status: 404 });
    }

    const initialCount = Number(initialBirdCount);
    const costPerBird = Number(purchaseCostPerBird);
    const totalCost = initialCount * costPerBird;

    const flock = await Flock.create({
      batchId: batchId.toUpperCase().trim(),
      name: name.trim(),
      breed: breed.trim(),
      supplier: supplier ? supplier.trim() : 'স্থানীয় সরবরাহকারী',
      shedId,
      arrivalDate: new Date(arrivalDate),
      ageInWeeksAtArrival: Number(ageInWeeksAtArrival) || 0,
      initialBirdCount: initialCount,
      currentBirdCount: initialCount,
      purchaseCostPerBird: costPerBird,
      totalPurchaseCost: totalCost,
      status: 'ACTIVE',
      notes,
    });

    // Update Shed occupancy and status
    shed.currentOccupancy = initialCount;
    shed.status = 'ACTIVE';
    await shed.save();

    // If purchase cost exists, optionally record in expense
    if (totalCost > 0) {
      await Expense.create({
        date: new Date(arrivalDate).toISOString().split('T')[0],
        category: 'CHICKS',
        description: `নতুন মুরগি/বাচ্চা ক্রয় - ফ্লক: ${flock.name} (${flock.batchId}), ${initialCount}টি`,
        amount: totalCost,
        paymentMethod: 'CASH',
        supplierOrPayee: flock.supplier,
        notes: `প্রতিটি মুরগি ৳${costPerBird}`,
        recordedByUid: user.uid,
      });
    }

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'FLOCKS',
      recordId: flock._id.toString(),
      details: `নতুন ফ্লক শুরু হয়েছে: ${flock.name} (${flock.batchId}), প্রাথমিক সংখ্যা: ${initialCount}`,
    });

    return NextResponse.json({ success: true, flock }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ফ্লক যোগ করতে সমস্যা হয়েছে';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
