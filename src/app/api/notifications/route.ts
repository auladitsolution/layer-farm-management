import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { FeedItem } from '@/models/FeedItem';
import { Setting } from '@/models/Setting';
import { VaccinationSchedule } from '@/models/VaccinationSchedule';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check dynamic alerts (Feed low stock, upcoming vaccination)
    const settings = (await Setting.findOne()) || { lowFeedThresholdKg: 200 };
    const lowFeeds = await FeedItem.find({ currentStockKg: { $lte: settings.lowFeedThresholdKg } });
    
    for (const feed of lowFeeds) {
      const existing = await Notification.findOne({
        title: 'খাদ্যের স্টক সতর্কবার্তা',
        message: { $regex: feed.name },
        isRead: false,
      });
      if (!existing) {
        await Notification.create({
          title: 'খাদ্যের স্টক সতর্কবার্তা',
          message: `${feed.name} এর বর্তমান স্টক কমে মাত্র ${feed.currentStockKg} কেজিতে নেমে এসেছে। দ্রুত অর্ডার করুন।`,
          type: 'WARNING',
          link: '/feed',
        });
      }
    }

    // Check upcoming vaccination within next 2 days
    const today = new Date().toISOString().split('T')[0];
    const upcomingVaccines = await VaccinationSchedule.find({
      status: 'PENDING',
      scheduledDate: { $gte: today },
    }).limit(3);

    for (const vax of upcomingVaccines) {
      const existing = await Notification.findOne({
        title: 'আসন্ন টিকাদান কর্মসূচি',
        message: { $regex: vax.vaccineName },
        isRead: false,
      });
      if (!existing) {
        await Notification.create({
          title: 'আসন্ন টিকাদান কর্মসূচি',
          message: `${vax.flockName} এর জন্য ${vax.vaccineName} টিকা দেওয়ার নির্ধারিত তারিখ: ${vax.scheduledDate}`,
          type: 'INFO',
          link: '/health',
        });
      }
    }

    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    return NextResponse.json(notifications);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'বিজ্ঞপ্তি পাওয়া যায়নি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
