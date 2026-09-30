import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Shed } from '@/models/Shed';
import { Flock } from '@/models/Flock';
import { getCurrentUser, hasRequiredRole } from '@/lib/auth';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    await connectToDatabase();
    const sheds = await Shed.find().sort({ code: 1 }).lean();

    // Attach active flock and dynamic occupancy
    const shedsWithOccupancy = await Promise.all(
      sheds.map(async (shed) => {
        const activeFlock = await Flock.findOne({
          shedId: shed._id,
          status: 'ACTIVE',
        }).lean();

        const currentOccupancy = activeFlock ? activeFlock.currentBirdCount : 0;
        return {
          ...shed,
          currentOccupancy,
          activeFlock: activeFlock
            ? { _id: activeFlock._id, name: activeFlock.name, batchId: activeFlock.batchId }
            : null,
        };
      })
    );

    return NextResponse.json(shedsWithOccupancy);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'শেড তথ্য লোড করা সম্ভব হয়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRequiredRole(user.role, ['OWNER', 'MANAGER'])) {
      return NextResponse.json(
        { error: 'নতুন শেড তৈরির অনুমতি আপনার নেই' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, code, capacity, type, notes } = body;

    if (!name || !code || !capacity) {
      return NextResponse.json(
        { error: 'শেডের নাম, কোড এবং ধারণক্ষমতা আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Shed.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: 'এই কোডের শেড ইতিমধ্যে বিদ্যমান রয়েছে' },
        { status: 400 }
      );
    }

    const shed = await Shed.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      capacity: Number(capacity),
      type: type || 'LAYER',
      status: 'ACTIVE',
      notes,
    });

    await AuditLog.create({
      userUid: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: 'CREATE',
      module: 'SHEDS',
      recordId: shed._id.toString(),
      details: `নতুন শেড যোগ করা হয়েছে: ${shed.name} (${shed.code}), ধারণক্ষমতা: ${shed.capacity}`,
    });

    return NextResponse.json({ success: true, shed }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'শেড যোগ করা সম্ভব হয়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
