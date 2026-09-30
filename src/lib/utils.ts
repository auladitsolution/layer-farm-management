import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts English digits to Bangla digits (e.g. 1234 -> ১২৩৪)
 */
export function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '০';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return val.toString().replace(/[0-9]/g, (w) => banglaDigits[+w]);
}

/**
 * Formats a number into Bangladeshi Taka currency format (৳ ১,৫০,০০০)
 */
export function formatTaka(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) amount = 0;
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  
  // Format with standard Bangladeshi comma separator (lakhs & crores)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);

  return `৳ ${toBengaliNumber(formatted)}`;
}

/**
 * Formats dates into friendly Bangla format (যেমন: ৩০ সেপ্টেম্বর, ২০২৬)
 */
export function formatBengaliDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'তারিখ প্রযোজ্য নয়';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const day = toBengaliNumber(date.getDate());
  const month = months[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());

  return `${day} ${month}, ${year}`;
}

/**
 * Scientifically accurate Hen-Day Egg Production Percentage
 * Formula: (Total Eggs Produced / Total Hens Present) * 100
 */
export function calculateHenDayProduction(totalEggs: number, birdCount: number): number {
  if (!birdCount || birdCount <= 0) return 0;
  return Number(((totalEggs / birdCount) * 100).toFixed(2));
}

/**
 * Feed per bird in Grams
 * Formula: (Total Feed in Kg * 1000) / Bird Count
 */
export function calculateFeedPerBird(feedKg: number, birdCount: number): number {
  if (!birdCount || birdCount <= 0) return 0;
  return Number(((feedKg * 1000) / birdCount).toFixed(1));
}

/**
 * Mortality Percentage
 * Formula: (Dead Birds / Initial Bird Count) * 100
 */
export function calculateMortalityRate(deadBirds: number, initialBirds: number): number {
  if (!initialBirds || initialBirds <= 0) return 0;
  return Number(((deadBirds / initialBirds) * 100).toFixed(2));
}

/**
 * Calculates current age of flock in weeks & days based on arrival date and age at arrival
 */
export function calculateFlockAge(arrivalDate: string | Date, ageInWeeksAtArrival: number): { weeks: number; days: number; text: string } {
  const arrival = new Date(arrivalDate);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - arrival.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const additionalWeeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;
  
  const totalWeeks = ageInWeeksAtArrival + additionalWeeks;
  
  return {
    weeks: totalWeeks,
    days: remainingDays,
    text: `${toBengaliNumber(totalWeeks)} সপ্তাহ ${remainingDays > 0 ? `${toBengaliNumber(remainingDays)} দিন` : ''}`.trim()
  };
}
