import { cookies } from 'next/headers';
import { connectToDatabase } from './mongodb';
import { User } from '@/models/User';
import { verifyFirebaseIdToken } from './firebase-admin';
import { UserRole, IUser } from '@/types';
export { ROLE_LABELS_BN, ROLE_HIERARCHY, hasRequiredRole } from './roles';

/**
 * Retrieves the current authenticated user from session cookie & database
 */
export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('poultry_session_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = await verifyFirebaseIdToken(token);
    if (!decoded || !decoded.uid) {
      return null;
    }

    await connectToDatabase();
    let dbUser = await User.findOne({ uid: decoded.uid });

    const rawOwnerEmails = process.env.INITIAL_OWNER_EMAIL || 'auladinfo@gmail.com,auladdevops@gmail.com,owner@auladfarm.com';
    const ownerEmails = rawOwnerEmails.split(',').map((e) => e.trim().toLowerCase());
    const userEmail = (decoded.email || '').toLowerCase();

    const isDesignatedOwner = ownerEmails.includes(userEmail) || decoded.uid === 'demo-owner-101';

    // Handle initial bootstrap if user does not exist
    if (!dbUser) {
      const existingHumanOwner = await User.findOne({
        role: 'OWNER',
        uid: { $ne: 'demo-owner-101' },
        email: { $nin: ['owner@auladfarm.com', ''] },
      });
      const shouldBeOwner = isDesignatedOwner || !existingHumanOwner;

      dbUser = await User.create({
        uid: decoded.uid,
        email: decoded.email || 'user@poultryfarm.com',
        displayName: decoded.name || 'খামার ব্যবহারকারী',
        photoURL: decoded.picture || '',
        role: shouldBeOwner ? 'OWNER' : 'STAFF',
        isActive: true,
      });
    } else if (isDesignatedOwner && dbUser.role !== 'OWNER') {
      // Auto-upgrade designated owner if previously marked as STAFF
      dbUser.role = 'OWNER';
      if (decoded.name && (!dbUser.displayName || dbUser.displayName === 'খামার ব্যবহারকারী')) {
        dbUser.displayName = decoded.name;
      }
      await dbUser.save();
    }

    if (!dbUser.isActive) {
      return null; // Deactivated user
    }

    return {
      _id: dbUser._id.toString(),
      uid: dbUser.uid,
      email: dbUser.email,
      displayName: dbUser.displayName,
      phoneNumber: dbUser.phoneNumber,
      photoURL: dbUser.photoURL,
      role: dbUser.role as UserRole,
      isActive: dbUser.isActive,
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}
