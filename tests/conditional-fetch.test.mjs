/**
 * Automated Unit Test Suite for Conditional Data Fetching Logic
 * Tests process.env.NEXT_PUBLIC_DEMO_MODE behavior (Demo vs API Fetching)
 */

// Simulated isDemoMode logic matching src/lib/api-client.ts
function isDemoMode() {
  const envVal = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (!envVal) return false;
  const normalized = envVal.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

// Registry of default mock data
const mockRegistry = {
  '/api/dashboard': {
    overview: { totalSheds: 3, todayEggs: 5415, currentBirdPopulation: 6000 },
    finance: { totalMonthlyIncome: 745000, estimatedNetProfit: 225000 },
  },
  '/api/flocks': [
    { batchId: 'BATCH-2026-01', breed: 'হাইল্যাইন ব্রাউন', currentBirdCount: 3200 },
    { batchId: 'BATCH-2026-02', breed: 'নোভোজেন হোয়াইট', currentBirdCount: 2800 },
  ],
  '/api/sheds': [
    { code: 'SHED-01', name: 'শেড ১', capacity: 3500 },
    { code: 'SHED-02', name: 'শেড ২', capacity: 3000 },
  ],
};

function getMockDataForEndpoint(url) {
  const cleanPath = url.split('?')[0].trim();
  return mockRegistry[cleanPath];
}

async function conditionalFetch(url, mockData, init, customFetch = globalThis.fetch) {
  if (isDemoMode()) {
    if (mockData !== undefined) {
      if (typeof mockData === 'function') {
        return await mockData();
      }
      return mockData;
    }

    const registryData = getMockDataForEndpoint(url);
    if (registryData !== undefined) {
      return registryData;
    }

    if (init?.method && init.method !== 'GET') {
      return { success: true, message: 'সফলভাবে সম্পন্ন হয়েছে (ডেমো মোড)' };
    }

    return {};
  }

  const response = await customFetch(url, init);
  if (!response.ok) {
    let errorMessage = `API Request failed with status ${response.status}`;
    try {
      const err = await response.json();
      if (err?.error) errorMessage = err.error;
    } catch {}
    throw new Error(errorMessage);
  }

  return await response.json();
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log(' কন্ডিশনাল ডেটা ফেচিং টেস্ট (NEXT_PUBLIC_DEMO_MODE)');
  console.log('======================================================');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(` ✅ [উত্তীর্ণ] ${testName}`);
      passed++;
    } else {
      console.error(` ❌ [ব্যর্থ] ${testName}`);
    }
  }

  const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;

  try {
    // -------------------------------------------------------------------
    // Case 1: DEMO_MODE = 'true' -> Should return mock data without fetch
    // -------------------------------------------------------------------
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

    let fetchCalled = false;
    const dummyFetch = async () => {
      fetchCalled = true;
      return { ok: true, json: async () => ({ live: true }) };
    };

    // 1.1 Direct custom mock data
    const explicitMock = { id: 101, title: 'টেস্ট ডেমো ডেটা' };
    const res1 = await conditionalFetch('/api/test', explicitMock, undefined, dummyFetch);
    assert(res1.id === 101 && !fetchCalled, 'DEMO_MODE="true" হলে সরাসরি মক অবজেক্ট রিটার্ন করে এবং fetch কল হয় না');

    // 1.2 Mock factory function
    const mockFactory = () => ({ status: 'computed', timestamp: 12345 });
    const res2 = await conditionalFetch('/api/computed', mockFactory, undefined, dummyFetch);
    assert(res2.status === 'computed' && res2.timestamp === 12345, 'DEMO_MODE="true" হলে মক ফ্যাক্টরি ফাংশন এক্সিকিউট করে রিটার্ন করে');

    // 1.3 Automatic registry mock resolution
    const dashMock = await conditionalFetch('/api/dashboard', undefined, undefined, dummyFetch);
    assert(dashMock?.overview?.todayEggs === 5415, 'DEMO_MODE="true" হলে এন্ডপয়েন্ট রেজিস্ট্রি থেকে ড্যাশবোর্ড মক ডেটা রিটার্ন করে');

    const flocksMock = await conditionalFetch('/api/flocks?status=ACTIVE', undefined, undefined, dummyFetch);
    assert(Array.isArray(flocksMock) && flocksMock.length === 2, 'কুয়েরি প্যারামিটার যুক্ত URL এর ক্ষেত্রেও রেজিস্ট্রি থেকে ফ্লক মক ডেটা রিটার্ন করে');

    // 1.4 Non-GET mutation simulation
    const mutationRes = await conditionalFetch('/api/sales', undefined, { method: 'POST' }, dummyFetch);
    assert(mutationRes.success === true, 'DEMO_MODE="true" হলে POST মিউটেশনে সিমুলেটেড রেসপন্স প্রদান করে');

    // -------------------------------------------------------------------
    // Case 2: DEMO_MODE = 'false' -> Should call real fetch API
    // -------------------------------------------------------------------
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
    fetchCalled = false;
    let requestedUrl = '';

    const mockLiveFetch = async (url) => {
      fetchCalled = true;
      requestedUrl = url;
      return {
        ok: true,
        json: async () => ({ source: 'live_database', records: [1, 2, 3] }),
      };
    };

    const liveRes = await conditionalFetch('/api/flocks', [{ dummy: 'mock' }], undefined, mockLiveFetch);
    assert(fetchCalled === true && requestedUrl === '/api/flocks', 'DEMO_MODE="false" হলে আসল API fetch কল করে');
    assert(liveRes.source === 'live_database' && liveRes.records.length === 3, 'DEMO_MODE="false" হলে API রেসপন্সের লাইভ ডেটা রিটার্ন করে');

    // -------------------------------------------------------------------
    // Case 3: Error handling when API returns non-200 in Live Mode
    // -------------------------------------------------------------------
    const failingFetch = async () => ({
      ok: false,
      status: 404,
      json: async () => ({ error: 'রিসোর্স পাওয়া যায়নি' }),
    });

    let errorCaught = false;
    try {
      await conditionalFetch('/api/unknown', undefined, undefined, failingFetch);
    } catch (e) {
      errorCaught = e.message.includes('রিসোর্স পাওয়া যায়নি');
    }
    assert(errorCaught, 'Live মোডে API ত্রুটি হলে হ্যান্ডেল করে এরর থ্রো করে');

    // -------------------------------------------------------------------
    // Case 4: Environment string variants
    // -------------------------------------------------------------------
    process.env.NEXT_PUBLIC_DEMO_MODE = '1';
    assert(isDemoMode() === true, 'NEXT_PUBLIC_DEMO_MODE="1" ডেমো মোড সক্রিয় হিসেবে গৃহীত হয়');

    process.env.NEXT_PUBLIC_DEMO_MODE = '0';
    assert(isDemoMode() === false, 'NEXT_PUBLIC_DEMO_MODE="0" লাইভ মোড হিসেবে গৃহীত হয়');

    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    assert(isDemoMode() === false, 'এনভায়রনমেন্ট ভেরিয়েবল না থাকলে ডিফল্টভাবে লাইভ মোড (false) হয়');

  } finally {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    }
  }

  console.log('======================================================');
  console.log(` মোট টেস্ট: ${total}টি | উত্তীর্ণ: ${passed}টি | ব্যর্থ: ${total - passed}টি`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite();
