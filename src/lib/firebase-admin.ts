import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getFirebaseAdmin() {
  const currentApps = getApps();
  if (currentApps.length > 0) {
    return currentApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey && !privateKey.includes('MOCK') && privateKey.length > 50) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (err) {
      console.warn('⚠️ Firebase admin initialize error:', err);
    }
  }

  try {
    return initializeApp({
      projectId: projectId || 'demo-poultry-farm',
    });
  } catch {
    return getApp();
  }
}

export async function verifyFirebaseIdToken(token: string) {
  // If it's a dev or mock token, handle immediately without Firebase network call
  if (token.startsWith('mock-token-') || token.startsWith('dev-') || token.startsWith('dev:')) {
    let uid = 'demo-owner-101';
    let email = 'owner@auladfarm.com';
    let name = 'মোহাম্মদ আওলাদ হোসেন (মালিক)';

    if (token.startsWith('dev:')) {
      const parts = token.split(':');
      uid = parts[1] || uid;
      email = parts[2] || email;
      name = parts[3] || name;
    } else if (token.startsWith('dev-')) {
      const stripped = token.replace('dev-', '');
      const parts = stripped.split(':');
      uid = parts[0] || uid;
      email = parts[1] || email;
      name = parts[2] || name;
    }

    return {
      uid,
      email,
      name,
      picture: '/placeholder-avatar.png',
    };
  }

  try {
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new Error('অননুমোদিত অ্যাক্সেস বা মেয়াদোত্তীর্ণ টোকেন (Invalid or expired token)');
  }
}

export { getFirebaseAdmin };
