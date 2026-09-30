import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { role = 'OWNER' } = await req.json();
    const validRoles: UserRole[] = ['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY_MANAGER', 'STAFF'];
    const chosenRole: UserRole = validRoles.includes(role as UserRole) ? (role as UserRole) : 'OWNER';

    const roleNameMap: Record<UserRole, { name: string; email: string }> = {
      OWNER: { name: 'মোহাম্মদ আওলাদ হোসেন (মালিক)', email: 'owner@auladfarm.com' },
      MANAGER: { name: 'ফারুক আহমেদ (ম্যানেজার)', email: 'manager@auladfarm.com' },
      ACCOUNTANT: { name: 'রফিকুল ইসলাম (হিসাবরক্ষক)', email: 'accountant@auladfarm.com' },
      INVENTORY_MANAGER: { name: 'জাহিদুল হক (স্টোর ম্যানেজার)', email: 'inventory@auladfarm.com' },
      STAFF: { name: 'কামাল উদ্দিন (ফার্ম কর্মী)', email: 'staff@auladfarm.com' },
    };

    const target = roleNameMap[chosenRole];
    const uid = `demo-${chosenRole.toLowerCase()}-101`;

    await connectToDatabase();
    let dbUser = await User.findOne({ uid });

    if (!dbUser) {
      dbUser = await User.create({
        uid,
        email: target.email,
        displayName: target.name,
        photoURL: '',
        role: chosenRole,
        isActive: true,
      });
    } else {
      dbUser.role = chosenRole;
      dbUser.displayName = target.name;
      dbUser.email = target.email;
      await dbUser.save();
    }

    const token = `dev:${uid}:${target.email}:${target.name}`;

    const response = NextResponse.json({
      success: true,
      user: {
        uid: dbUser.uid,
        email: dbUser.email,
        displayName: dbUser.displayName,
        role: dbUser.role,
      },
    });

    response.cookies.set('poultry_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error('Demo login error:', error);
    const message = error instanceof Error ? error.message : 'লগইন সম্ভব হয়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
