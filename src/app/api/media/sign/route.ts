import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'লগইন আবশ্যক' }, { status: 401 });
    }

    const { folder = 'poultry_farm' } = await req.json();
    const timestamp = Math.round(new Date().getTime() / 1000);

    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'mock-secret';
    const apiKey = process.env.CLOUDINARY_API_KEY || 'mock-key';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'mock-cloud';

    // Cloudinary signature params string (alphabetically sorted)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return NextResponse.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'স্বাক্ষর তৈরিতে ত্রুটি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
