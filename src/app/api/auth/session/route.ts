import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/firebase-admin';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'টোকেন প্রদান করা হয়নি (Token missing)' }, { status: 400 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: 'টোকেন যাচাইকরণ ব্যর্থ হয়েছে' }, { status: 401 });
    }

    await connectToDatabase();

    const rawOwnerEmails = process.env.INITIAL_OWNER_EMAIL || 'auladinfo@gmail.com,auladdevops@gmail.com,owner@auladfarm.com';
    const ownerEmails = rawOwnerEmails.split(',').map((e) => e.trim().toLowerCase());
    const userEmail = (decoded.email || '').toLowerCase();

    // Check if any human owner already exists in the farm
    const existingHumanOwner = await User.findOne({
      role: 'OWNER',
      uid: { $ne: 'demo-owner-101' },
      email: { $nin: ['owner@auladfarm.com', ''] },
    });

    const isDesignatedOwner = ownerEmails.includes(userEmail) || decoded.uid === 'demo-owner-101';
    const isFirstHuman = !existingHumanOwner;
    const shouldBeOwner = isDesignatedOwner || isFirstHuman;

    let user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        email: decoded.email || 'user@poultryfarm.com',
        displayName: decoded.name || 'খামার সদস্য',
        photoURL: decoded.picture || '',
        role: shouldBeOwner ? 'OWNER' : 'STAFF',
        isActive: true,
      });

      await AuditLog.create({
        userUid: user.uid,
        userName: user.displayName,
        userRole: user.role,
        action: 'CREATE',
        module: 'AUTHENTICATION',
        recordId: user._id.toString(),
        details: `নতুন ব্যবহারকারী নিবন্ধন করেছেন (${user.role})`,
      });
    } else if (shouldBeOwner && user.role !== 'OWNER') {
      // Automatically promote to OWNER if matching owner credentials
      user.role = 'OWNER';
      if (decoded.name && (!user.displayName || user.displayName === 'খামার সদস্য')) {
        user.displayName = decoded.name;
      }
      await user.save();
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে খামার মালিকের সাথে যোগাযোগ করুন।' },
        { status: 403 }
      );
    }

    // Set HTTP-only secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        photoURL: user.photoURL,
      },
    });

    response.cookies.set('poultry_session_token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Session creation error:', error);
    const message = error instanceof Error ? error.message : 'লগইন প্রক্রিয়া সম্পন্ন করা সম্ভব হয়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
