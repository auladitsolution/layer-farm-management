import {
  calculateHenDayProduction,
  calculateFeedPerBird,
  calculateMortalityRate,
  calculateFlockAge,
  toBengaliNumber,
  formatTaka,
} from '../src/lib/utils';
import { hasRequiredRole } from '../src/lib/auth';
import { UserRole } from '../src/types';

function runTests() {
  console.log('--- শুরু হচ্ছে পোল্ট্রি খামার ক্যালকুলেশন ও বিজনেস লজিক টেস্ট ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Hen-Day Production Formula
  // 2400 eggs from 3000 hens = (2400 / 3000) * 100 = 80.00%
  const henDay = calculateHenDayProduction(2400, 3000);
  assert(henDay === 80, `Hen-Day ডিম উৎপাদন হার সঠিক: ${henDay}%`);

  // Test 2: Hen-Day with zero hens
  assert(calculateHenDayProduction(100, 0) === 0, 'শূন্য মুরগিতে হেন-ডে হার ০ হওয়া উচিত');

  // Test 3: Feed Per Bird in Grams
  // 360 kg feed for 3000 birds = (360 * 1000) / 3000 = 120 grams
  const feedGrams = calculateFeedPerBird(360, 3000);
  assert(feedGrams === 120, `প্রতি মুরগির খাদ্য গ্রহণ সঠিক: ${feedGrams} গ্রাম`);

  // Test 4: Mortality Rate Percentage
  // 3 dead birds from 3000 = (3 / 3000) * 100 = 0.10%
  const mortRate = calculateMortalityRate(3, 3000);
  assert(mortRate === 0.1, `মৃত্যুহার শতকরা হিসাব সঠিক: ${mortRate}%`);

  // Test 5: Flock Age Calculation
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const age = calculateFlockAge(twoWeeksAgo, 16);
  assert(age.weeks === 18, `ফ্লকের বয়স গণনা সঠিক: ১৬ + ২ = ১৮ সপ্তাহ (ফলাফল: ${age.weeks} সপ্তাহ)`);

  // Test 6: Bangla Number Conversion
  const bnNum = toBengaliNumber(1250);
  assert(bnNum === '১২৫০', `ইংরেজি সংখ্যা থেকে বাংলায় রূপান্তর সঠিক: ${bnNum}`);

  // Test 7: Taka Formatting
  const taka = formatTaka(150000);
  assert(taka.includes('৳') && taka.includes('১,৫০,০০০'), `টাকা ফরম্যাটিং সঠিক: ${taka}`);

  // Test 8: RBAC Permissions Check
  assert(hasRequiredRole('OWNER', ['STAFF', 'MANAGER']), 'OWNER এর সব মডিউলে পূর্ণ অ্যাক্সেস রয়েছে');
  assert(hasRequiredRole('MANAGER', ['OWNER', 'MANAGER']), 'MANAGER এর অপারেশন্সে অ্যাক্সেস রয়েছে');
  assert(!hasRequiredRole('STAFF', ['OWNER', 'ACCOUNTANT']), 'STAFF এর ফাইন্যান্সিয়াল মডিউলে অ্যাক্সেস নিষিদ্ধ');

  console.log(`\n========================================`);
  console.log(`টেস্ট ফলাফল: মোট ${passed + failed}টি, সফল: ${passed}টি, ব্যর্থ: ${failed}টি`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
