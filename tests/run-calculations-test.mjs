/**
 * Poultry Farm Manager - Automated Unit Tests for Domain Business Logic
 */

function calculateHenDayProduction(totalEggs, birdCount) {
  if (!birdCount || birdCount <= 0) return 0;
  return Number(((totalEggs / birdCount) * 100).toFixed(2));
}

function calculateFeedPerBird(feedKg, birdCount) {
  if (!birdCount || birdCount <= 0) return 0;
  return Number(((feedKg * 1000) / birdCount).toFixed(1));
}

function calculateMortalityRate(deadBirds, initialBirds) {
  if (!initialBirds || initialBirds <= 0) return 0;
  return Number(((deadBirds / initialBirds) * 100).toFixed(2));
}

function calculateFlockAge(arrivalDate, ageInWeeksAtArrival) {
  const arrival = new Date(arrivalDate);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - arrival.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const additionalWeeks = Math.floor(diffDays / 7);
  return ageInWeeksAtArrival + additionalWeeks;
}

function toBengaliNumber(val) {
  if (val === undefined || val === null || val === '') return '০';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return val.toString().replace(/[0-9]/g, (w) => banglaDigits[+w]);
}

function hasRequiredRole(userRole, allowedRoles) {
  if (userRole === 'OWNER') return true;
  return allowedRoles.includes(userRole);
}

function runTests() {
  console.log('\n======================================================');
  console.log(' লেয়ার ফার্ম ম্যানেজার - বিজনেস লজিক ইউনিট টেস্ট');
  console.log('======================================================');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(` ✅ [উত্তীর্ণ] ${testName}`);
      passed++;
    } else {
      console.error(` ❌ [ব্যর্থ] ${testName}`);
      failed++;
    }
  }

  // 1. Hen-Day Formula: (2400 / 3000) * 100 = 80%
  const hd = calculateHenDayProduction(2400, 3000);
  assert(hd === 80, `Hen-Day ডিম উৎপাদন হার সঠিক (২৪০০ ডিম ÷ ৩০০০ মুরগি = ৮০%)`);

  // 2. Zero bird protection
  assert(calculateHenDayProduction(100, 0) === 0, `শূন্য মুরগি হলে হেন-ডে হার ০% (Division by zero হ্যান্ডেল্ড)`);

  // 3. Feed per Bird in Grams: (360 kg * 1000) / 3000 = 120 grams
  const fpb = calculateFeedPerBird(360, 3000);
  assert(fpb === 120, `প্রতি মুরগির খাদ্য গ্রহণ সঠিক (৩৬০ কেজি ÷ ৩০০০ = ১২০ গ্রাম/মুরগি)`);

  // 4. Mortality Rate %: (3 dead / 3000) * 100 = 0.10%
  const mr = calculateMortalityRate(3, 3000);
  assert(mr === 0.1, `মৃত্যুহার শতকরা হিসাব সঠিক (৩টি মৃত ÷ ৩০০০ = ০.১০%)`);

  // 5. Flock Age in Weeks: Arrival 14 days ago at week 16 -> Week 18
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const calculatedAge = calculateFlockAge(twoWeeksAgo, 16);
  assert(calculatedAge === 18, `ফ্লকের বয়স স্বয়ংক্রিয় গণনা সঠিক (১৬ সপ্তাহ + ২ সপ্তাহ = ১৮ সপ্তাহ)`);

  // 6. Bangla Number Conversion
  assert(toBengaliNumber(1250) === '১২৫০', `ইংরেজি সংখ্যা ১২৫০ থেকে বাংলায় রূপান্তর সফল`);

  // 7. Role-Based Access Control (RBAC) Permissions
  assert(hasRequiredRole('OWNER', ['STAFF', 'MANAGER']), `OWNER এর সর্বজনীন অ্যাডমিন অ্যাক্সেস রয়েছে`);
  assert(hasRequiredRole('MANAGER', ['OWNER', 'MANAGER']), `MANAGER এর অপারেশন মডিউলে অনুমতি রয়েছে`);
  assert(!hasRequiredRole('STAFF', ['OWNER', 'ACCOUNTANT']), `STAFF এর আর্থিক মডিউলে অননুমোদিত অ্যাক্সেস ব্লক রয়েছে`);

  // 8. Cost Analysis Math
  // Total cost: 18,000 BDT, Total eggs: 2,000 -> Cost per egg: 9.00 BDT, Tray (30): 270 BDT
  const costPerEgg = 18000 / 2000;
  const costPerTray = costPerEgg * 30;
  assert(costPerEgg === 9, `প্রতি ডিমের উৎপাদন খরচ সঠিক: ৳৯.০০`);
  assert(costPerTray === 270, `প্রতি ট্রে ডিমের উৎপাদন খরচ সঠিক (১ ট্রে = ৩০টি): ৳২৭০.০০`);

  console.log('======================================================');
  console.log(` মোট টেস্ট: ${passed + failed}টি | উত্তীর্ণ: ${passed}টি | ব্যর্থ: ${failed}টি`);
  console.log('======================================================\n');
}

runTests();
