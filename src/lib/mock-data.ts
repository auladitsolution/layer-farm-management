import {
  IUser,
  IShed,
  IFlock,
  IDailyEntry,
  IEggInventory,
  ICustomer,
  IEggSale,
  ICustomerPayment,
  ISupplier,
  IFeedItem,
  IFeedPurchase,
  IMedicine,
  IVaccinationSchedule,
  IMortalityRecord,
  IExpense,
  IIncome,
  IEmployee,
  ISetting,
  IAuditLog,
  INotification,
  UserRole,
} from '@/types';

// 1. Mock Users mapped by Role
export const mockUsersByRole: Record<UserRole, IUser> = {
  OWNER: {
    uid: 'demo-owner-101',
    email: 'owner@auladfarm.com',
    displayName: 'মোহাম্মদ আওলাদ হোসেন (মালিক)',
    role: 'OWNER',
    isActive: true,
    phoneNumber: '01711-000000',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  MANAGER: {
    uid: 'demo-manager-101',
    email: 'manager@auladfarm.com',
    displayName: 'ফারুক আহমেদ (ম্যানেজার)',
    role: 'MANAGER',
    isActive: true,
    phoneNumber: '01715-112233',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  ACCOUNTANT: {
    uid: 'demo-accountant-101',
    email: 'accountant@auladfarm.com',
    displayName: 'রফিকুল ইসলাম (হিসাবরক্ষক)',
    role: 'ACCOUNTANT',
    isActive: true,
    phoneNumber: '01818-445566',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  INVENTORY_MANAGER: {
    uid: 'demo-inventory-101',
    email: 'inventory@auladfarm.com',
    displayName: 'জাহিদুল হক (স্টোর ম্যানেজার)',
    role: 'INVENTORY_MANAGER',
    isActive: true,
    phoneNumber: '01912-778899',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  STAFF: {
    uid: 'demo-staff-101',
    email: 'staff@auladfarm.com',
    displayName: 'কামাল উদ্দিন (ফার্ম কর্মী)',
    role: 'STAFF',
    isActive: true,
    phoneNumber: '01611-334455',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
};

/**
 * Resolves the currently active demo user based on client storage/cookies.
 */
export function getActiveMockUser(): IUser {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('poultry_demo_role') as UserRole | null;
      if (stored && mockUsersByRole[stored]) {
        return mockUsersByRole[stored];
      }

      const match = document.cookie.match(/poultry_demo_role=([A-Z_]+)/);
      if (match && match[1]) {
        const cookieRole = match[1] as UserRole;
        if (mockUsersByRole[cookieRole]) {
          return mockUsersByRole[cookieRole];
        }
      }
    } catch {
      // LocalStorage or cookie read failure fallback
    }
  }
  return mockUsersByRole.OWNER;
}

export const mockCurrentUser: IUser = mockUsersByRole.OWNER;

// 2. Mock Sheds
export const mockSheds: IShed[] = [
  {
    _id: 'shed-001',
    name: 'শেড ১ (লেয়ার ইউনিট-এ)',
    code: 'SHED-01',
    capacity: 3500,
    currentOccupancy: 3200,
    type: 'LAYER',
    status: 'ACTIVE',
    notes: 'আধুনিক স্বয়ংক্রিয় খাবার ও পানির নিপল ব্যবস্থা যুক্ত',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'shed-002',
    name: 'শেড ২ (লেয়ার ইউনিট-বি)',
    code: 'SHED-02',
    capacity: 3000,
    currentOccupancy: 2800,
    type: 'LAYER',
    status: 'ACTIVE',
    notes: 'বায়ো-সিকিউরিটি জোন এবং এক্সহস্ট ফ্যান নিয়ন্ত্রিত',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'shed-003',
    name: 'শেড ৩ (গ্রোয়ার ও ব্রুডার)',
    code: 'SHED-03',
    capacity: 2000,
    currentOccupancy: 0,
    type: 'GROWER',
    status: 'CLEANING',
    notes: 'জীবাণুমুক্তকরণ ও চুনকামের কাজ চলমান',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// 3. Mock Flocks
export const mockFlocks: IFlock[] = [
  {
    _id: 'flock-001',
    batchId: 'BATCH-2026-01',
    name: 'ব্যাচ ০১ (হাই-লাইন ব্রাউন)',
    breed: 'হাইল্যাইন ব্রাউন (Hy-Line Brown)',
    supplier: 'সিপি বাংলাদেশ লিমিটেড',
    shedId: 'shed-001',
    shedName: 'শেড ১ (লেয়ার ইউনিট-এ)',
    arrivalDate: '2025-10-10',
    ageInWeeksAtArrival: 16,
    initialBirdCount: 3300,
    currentBirdCount: 3200,
    purchaseCostPerBird: 340,
    totalPurchaseCost: 1122000,
    status: 'ACTIVE',
    notes: 'পিক প্রোডাকশন (৯২% হেন-ডে ডিম উৎপাদন) চলমান',
    createdAt: '2025-10-10T00:00:00.000Z',
  },
  {
    _id: 'flock-002',
    batchId: 'BATCH-2026-02',
    name: 'ব্যাচ ০২ (নোভোজেন হোয়াইট)',
    breed: 'নোভোজেন হোয়াইট (Novogen White)',
    supplier: 'আফতাব বহুমুখী ফার্মস',
    shedId: 'shed-002',
    shedName: 'শেড ২ (লেয়ার ইউনিট-বি)',
    arrivalDate: '2025-12-15',
    ageInWeeksAtArrival: 16,
    initialBirdCount: 2900,
    currentBirdCount: 2800,
    purchaseCostPerBird: 350,
    totalPurchaseCost: 1015000,
    status: 'ACTIVE',
    notes: 'উৎপাদন হার ৮৮% এ স্থিতিশীল',
    createdAt: '2025-12-15T00:00:00.000Z',
  },
];

// 4. Mock Egg Inventory
export const mockEggInventory: IEggInventory = {
  _id: 'inv-001',
  totalPieces: 14250,
  goodPieces: 13980,
  brokenPieces: 180,
  dirtyPieces: 90,
  lastUpdated: new Date().toISOString(),
};

// 5. Mock Daily Entries
export const mockDailyEntries: IDailyEntry[] = [
  {
    _id: 'daily-001',
    date: new Date().toISOString().split('T')[0],
    shedId: 'shed-001',
    shedName: 'শেড ১ (লেয়ার ইউনিট-এ)',
    flockId: 'flock-001',
    flockName: 'ব্যাচ ০১ (হাই-লাইন ব্রাউন)',
    openingBirdCount: 3202,
    totalEggs: 2945,
    goodEggs: 2910,
    brokenEggs: 25,
    dirtyEggs: 10,
    rejectedEggs: 0,
    feedConsumedKg: 384,
    waterLiters: 760,
    mortalityCount: 2,
    culledCount: 0,
    closingBirdCount: 3200,
    eggProductionPercentage: 91.97,
    mortalityPercentage: 0.06,
    feedPerBirdGrams: 119.9,
    temperatureCelsius: 26,
    notes: 'উৎপাদন চমৎকার ও মুরগির স্বাস্থ্য স্বাভাবিক',
    recordedByName: 'ফারুক আহমেদ (ম্যানেজার)',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'daily-002',
    date: new Date().toISOString().split('T')[0],
    shedId: 'shed-002',
    shedName: 'শেড ২ (লেয়ার ইউনিট-বি)',
    flockId: 'flock-002',
    flockName: 'ব্যাচ ০২ (নোভোজেন হোয়াইট)',
    openingBirdCount: 2801,
    totalEggs: 2470,
    goodEggs: 2445,
    brokenEggs: 18,
    dirtyEggs: 7,
    rejectedEggs: 0,
    feedConsumedKg: 336,
    waterLiters: 670,
    mortalityCount: 1,
    culledCount: 0,
    closingBirdCount: 2800,
    eggProductionPercentage: 88.18,
    mortalityPercentage: 0.04,
    feedPerBirdGrams: 120.0,
    temperatureCelsius: 26,
    notes: 'বায়ো-সিকিউরিটি স্প্রে সম্পন্ন হয়েছে',
    recordedByName: 'ফারুক আহমেদ (ম্যানেজার)',
    createdAt: new Date().toISOString(),
  },
];

// 6. Mock Customers
export const mockCustomers: ICustomer[] = [
  {
    _id: 'cust-001',
    name: 'আলমগীর পোল্ট্রি ট্রেডার্স',
    businessName: 'আলমগীর আড়ত',
    phone: '01712-345678',
    address: 'কাপ্তান বাজার, ঢাকা',
    openingBalance: 0,
    currentDue: 35000,
    totalPurchases: 450000,
    totalPaid: 415000,
    notes: 'নিয়মিত ডিম পাইকারি ক্রেতা',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    _id: 'cust-002',
    name: 'মেসার্স ভাই ভাই এন্টারপ্রাইজ',
    businessName: 'ভাই ভাই স্টোর',
    phone: '01819-987654',
    address: 'গাজীপুর চৌরাস্তা',
    openingBalance: 0,
    currentDue: 12000,
    totalPurchases: 280000,
    totalPaid: 268000,
    notes: 'সাপ্তাহিক কিস্তিতে বিল পরিশোধ করেন',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    _id: 'cust-003',
    name: 'হাজী ডিম ভাণ্ডার',
    businessName: 'হাজী আড়ত',
    phone: '01911-223344',
    address: 'কারওয়ান বাজার, ঢাকা',
    openingBalance: 0,
    currentDue: 0,
    totalPurchases: 620000,
    totalPaid: 620000,
    notes: 'নগদ ক্রেতা - সাথে সাথে পেমেন্ট দেন',
    createdAt: '2026-01-12T00:00:00.000Z',
  },
];

// 7. Mock Sales
export const mockSales: IEggSale[] = [
  {
    _id: 'sale-001',
    invoiceNo: 'INV-2026-0089',
    customerId: 'cust-001',
    customerName: 'আলমগীর পোল্ট্রি ট্রেডার্স',
    customerPhone: '01712-345678',
    date: new Date().toISOString().split('T')[0],
    unitType: 'TRAY',
    quantityInUnit: 150,
    conversionRateToPieces: 30,
    totalPieces: 4500,
    unitPrice: 310,
    subTotal: 46500,
    discount: 500,
    grandTotal: 46000,
    paidAmount: 30000,
    dueAmount: 16000,
    paymentMethod: 'BANK',
    notes: 'ব্যাংক ট্রান্সফারের মাধ্যমে অগ্রিম ৩০,০০০ টাকা',
    recordedByName: 'রফিকুল ইসলাম (হিসাবরক্ষক)',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'sale-002',
    invoiceNo: 'INV-2026-0088',
    customerId: 'cust-003',
    customerName: 'হাজী ডিম ভাণ্ডার',
    customerPhone: '01911-223344',
    date: new Date().toISOString().split('T')[0],
    unitType: 'TRAY',
    quantityInUnit: 100,
    conversionRateToPieces: 30,
    totalPieces: 3000,
    unitPrice: 310,
    subTotal: 31000,
    discount: 0,
    grandTotal: 31000,
    paidAmount: 31000,
    dueAmount: 0,
    paymentMethod: 'CASH',
    notes: 'সম্পূর্ণ নগদ পরিশোধিত',
    recordedByName: 'রফিকুল ইসলাম (হিসাবরক্ষক)',
    createdAt: new Date().toISOString(),
  },
];

// 8. Mock Customer Payments
export const mockCustomerPayments: ICustomerPayment[] = [
  {
    _id: 'pay-001',
    receiptNo: 'REC-2026-0041',
    customerId: 'cust-001',
    customerName: 'আলমগীর পোল্ট্রি ট্রেডার্স',
    date: new Date().toISOString().split('T')[0],
    amount: 25000,
    paymentMethod: 'BANK',
    transactionRef: 'TRX-998822',
    notes: 'আগের বকেয়া পরিশোধ',
    receivedByName: 'রফিকুল ইসলাম (হিসাবরক্ষক)',
    createdAt: new Date().toISOString(),
  },
];

// 9. Mock Suppliers
export const mockSuppliers: ISupplier[] = [
  {
    _id: 'supp-001',
    name: 'নারিশ ফিড লিমিটেড',
    companyName: 'Nourish Poultry & Hatchery Ltd.',
    phone: '01713-112233',
    address: 'টঙ্গী, গাজীপুর',
    category: 'FEED',
    openingBalance: 0,
    currentPayable: 45000,
    totalPurchases: 520000,
    totalPaid: 475000,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'supp-002',
    name: 'রেনাটা এনিম্যাল হেলথ',
    companyName: 'Renata Limited',
    phone: '01819-334455',
    address: 'মিরপুর, ঢাকা',
    category: 'MEDICINE',
    openingBalance: 0,
    currentPayable: 8000,
    totalPurchases: 65000,
    totalPaid: 57000,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

// 10. Mock Feed Items
export const mockFeedItems: IFeedItem[] = [
  {
    _id: 'feed-001',
    name: 'লেয়ার লেয়ার-১ ম্যাশ (Layer-1)',
    type: 'LAYER_1',
    brand: 'নারিশ গোল্ড',
    unit: 'কেজি',
    bagWeightKg: 50,
    currentStockKg: 2850,
    lowStockThresholdKg: 1000,
    averagePurchasePricePerKg: 62.5,
    notes: 'পিক প্রোডাকশনের জন্য প্রোটিন ও ক্যালসিয়াম সমৃদ্ধ',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'feed-002',
    name: 'লেয়ার লেয়ার-২ ম্যাশ (Layer-2)',
    type: 'LAYER_2',
    brand: 'আফতাব ফিড',
    unit: 'কেজি',
    bagWeightKg: 50,
    currentStockKg: 1400,
    lowStockThresholdKg: 800,
    averagePurchasePricePerKg: 60.0,
    notes: 'বিকল্প স্টক হিসেবে সংরক্ষিত',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// 11. Mock Feed Purchases
export const mockFeedPurchases: IFeedPurchase[] = [
  {
    _id: 'fp-001',
    invoiceNo: 'FEED-INV-0045',
    supplierId: 'supp-001',
    supplierName: 'নারিশ ফিড লিমিটেড',
    feedItemId: 'feed-001',
    feedName: 'লেয়ার লেয়ার-১ ম্যাশ (Layer-1)',
    date: new Date().toISOString().split('T')[0],
    bagCount: 60,
    totalKg: 3000,
    pricePerKg: 62.5,
    subTotal: 187500,
    transportCost: 3500,
    discount: 1000,
    totalCost: 190000,
    paidAmount: 145000,
    dueAmount: 45000,
    paymentMethod: 'BANK',
    notes: '৬০ ব্যাগ ফিড সরবরাহ প্রাপ্ত ও স্টোরে সংরক্ষিত',
    createdAt: new Date().toISOString(),
  },
];

// 12. Mock Medicines
export const mockMedicines: IMedicine[] = [
  {
    _id: 'med-001',
    name: 'রেনা-সি ও মাল্টিভিটামিন (Rena-C)',
    type: 'VITAMIN',
    brand: 'রেনাটা',
    unit: 'গ্রাম',
    currentStock: 4500,
    lowStockThreshold: 1000,
    expiryDate: '2027-05-15',
    notes: 'তাপমাত্রা বৃদ্ধির সময়ে স্ট্রেস কমাতে পানিতে ব্যবহার্য',
  },
  {
    _id: 'med-002',
    name: 'ভাইরোকন-এস জীবাণুনাশক (Virkon S)',
    type: 'DISINFECTANT',
    brand: 'ল্যানক্সেস',
    unit: 'গ্রাম',
    currentStock: 2500,
    lowStockThreshold: 500,
    expiryDate: '2027-10-20',
    notes: 'শেড স্প্রে ও ফুটবাথে নিয়মিত ব্যবহার করা হয়',
  },
];

// 13. Mock Vaccination Schedules
export const mockVaccinations: IVaccinationSchedule[] = [
  {
    _id: 'vac-001',
    flockId: 'flock-001',
    flockName: 'ব্যাচ ০১ (হাই-লাইন ব্রাউন)',
    vaccineName: 'এনডি + আইবি বুস্টার (ND+IB)',
    targetBirdAgeWeeks: 24,
    scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    dose: '১ ডোজ / মুরগি',
    route: 'DRINKING_WATER',
    status: 'PENDING',
    responsiblePerson: 'ডাঃ মোজাম্মেল হক (ভেটেরিনারি সার্জন)',
    notes: 'ভোরের পানিতে স্কিম মিল্ক মিশিয়ে প্রদান করতে হবে',
  },
  {
    _id: 'vac-002',
    flockId: 'flock-002',
    flockName: 'ব্যাচ ০২ (নোভোজেন হোয়াইট)',
    vaccineName: 'কলেরা ও করাইজা ভ্যাকসিন',
    targetBirdAgeWeeks: 20,
    scheduledDate: '2026-02-15',
    dose: '০.৫ মিলি',
    route: 'INJECTION',
    status: 'COMPLETED',
    administeredDate: '2026-02-15',
    responsiblePerson: 'ডাঃ মোজাম্মেল হক',
    notes: 'সফলভাবে সম্পন্ন হয়েছে, কোনো পার্শ্বপ্রতিক্রিয়া দেখা যায়নি',
  },
];

// 14. Mock Mortality Records
export const mockMortality: IMortalityRecord[] = [
  {
    _id: 'mort-001',
    date: new Date().toISOString().split('T')[0],
    flockId: 'flock-001',
    flockName: 'ব্যাচ ০১ (হাই-লাইন ব্রাউন)',
    shedName: 'শেড ১ (লেয়ার ইউনিট-এ)',
    deadCount: 2,
    suspectedReason: 'স্বাভাবিক বয়সোচিত দুর্বলতা',
    recordedByUid: 'demo-manager-101',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mort-002',
    date: new Date().toISOString().split('T')[0],
    flockId: 'flock-002',
    flockName: 'ব্যাচ ০২ (নোভোজেন হোয়াইট)',
    shedName: 'শেড ২ (লেয়ার ইউনিট-বি)',
    deadCount: 1,
    suspectedReason: 'হিট স্ট্রোক লক্ষণ (হালকা)',
    recordedByUid: 'demo-manager-101',
    createdAt: new Date().toISOString(),
  },
];

// 15. Mock Expenses
export const mockExpenses: IExpense[] = [
  {
    _id: 'exp-001',
    date: new Date().toISOString().split('T')[0],
    category: 'FEED',
    description: 'নারিশ গোল্ড লেয়ার ফিড ক্রয় (৬০ ব্যাগ)',
    amount: 145000,
    paymentMethod: 'BANK',
    supplierOrPayee: 'নারিশ ফিড লিমিটেড',
    notes: 'ভাউচার নং: NF-2026-78',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'exp-002',
    date: new Date().toISOString().split('T')[0],
    category: 'ELECTRICITY',
    description: 'পল্লী বিদ্যুৎ বিল - চলতি মাস',
    amount: 18500,
    paymentMethod: 'BKASH',
    supplierOrPayee: 'পল্লী বিদ্যুৎ সমিতি',
    notes: 'বিকাশ পে বিল রেফারেন্স: BP-774411',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'exp-003',
    date: new Date().toISOString().split('T')[0],
    category: 'LITTER',
    description: 'কাঠের ভুসি ও লিটার ক্রয়',
    amount: 4500,
    paymentMethod: 'CASH',
    supplierOrPayee: 'স্থানীয় স-মিল',
    notes: 'শেড জীবাণুমুক্তকরণের পর লিটার বিছানো',
    createdAt: new Date().toISOString(),
  },
];

// 16. Mock Income
export const mockIncomes: IIncome[] = [
  {
    _id: 'inc-001',
    date: new Date().toISOString().split('T')[0],
    source: 'EGG_SALES',
    description: 'দৈনিক ডিম বিক্রয় (২৫০ ট্রে)',
    amount: 61000,
    paymentMethod: 'BANK',
    customerOrPayer: 'পাইকারি কাস্টমারগণ',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'inc-002',
    date: new Date().toISOString().split('T')[0],
    source: 'FEED_BAGS',
    description: 'খালি ফিডের বস্তা বিক্রয় (১২০টি)',
    amount: 3600,
    paymentMethod: 'CASH',
    customerOrPayer: 'স্থানীয় ক্রেতা',
    createdAt: new Date().toISOString(),
  },
];

// 17. Mock Finance Summary
export const mockFinanceSummary = {
  currentMonth: new Date().toISOString().substring(0, 7),
  totalIncome: 745000,
  totalExpense: 520000,
  netProfit: 225000,
  profitMarginPercent: 30.2,
  customerReceivables: 47000,
  supplierPayables: 53000,
  breakdown: [
    { category: 'ডিম বিক্রয়', amount: 720000, type: 'INCOME' },
    { category: 'ফিডের বস্তা বিক্রয়', amount: 25000, type: 'INCOME' },
    { category: 'ফিড ক্রয়', amount: 410000, type: 'EXPENSE' },
    { category: 'বিদ্যুৎ ও জ্বালানি', amount: 35000, type: 'EXPENSE' },
    { category: 'শ্রমিক মজুরি ও বেতন', amount: 55000, type: 'EXPENSE' },
    { category: 'ওষুধ ও ভ্যাকসিন', amount: 20000, type: 'EXPENSE' },
  ],
};

// 18. Mock Notifications
export const mockNotifications: INotification[] = [
  {
    _id: 'notif-001',
    title: 'ভ্যাকসিনেশন শিডিউল সতর্কবার্তা',
    message: 'ব্যাচ ০১ (হাই-লাইন ব্রাউন) এর জন্য আগামী ৫ দিনের মধ্যে ND+IB বুস্টার ভ্যাকসিন দেওয়ার তারিখ নির্ধারিত আছে।',
    type: 'WARNING',
    link: '/health',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'notif-002',
    title: 'লেয়ার-১ ফিড স্টক কমছে',
    message: 'লেয়ার-১ ফিডের বর্তমান স্টক ২,৮৫০ কেজিতে নেমে এসেছে। দ্রুত নতুন চালানের অর্ডার করুন।',
    type: 'ALERT',
    link: '/feed',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'notif-003',
    title: 'আজকের উৎপাদন লক্ষ্যমাত্রা অর্জিত',
    message: 'আজকের ডিম উৎপাদন হার ৯১.২% অতিক্রম করেছে। মোট সংগৃহীত ডিম: ৫,৪১৫টি।',
    type: 'SUCCESS',
    link: '/dashboard',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

// 19. Mock Farm Settings
export const mockSettings: ISetting = {
  _id: 'set-001',
  farmName: 'আওলাদ লেয়ার পোল্ট্রি ফার্ম',
  ownerName: 'মোহাম্মদ আওলাদ হোসেন',
  phone: '01711-000000',
  email: 'owner@auladfarm.com',
  address: 'মাওনা, শ্রীপুর, গাজীপুর, বাংলাদেশ',
  currency: '৳ BDT',
  traySize: 30,
  lowFeedThresholdKg: 1000,
  highMortalityThresholdPercent: 0.25,
  medicineExpiryNoticeDays: 30,
  enableGrading: true,
  updatedAt: new Date().toISOString(),
};

// 20. Mock Employees
export const mockEmployees: IEmployee[] = [
  {
    _id: 'emp-001',
    name: 'ফারুক আহমেদ',
    phone: '01715-112233',
    role: 'ফার্ম ম্যানেজার',
    monthlySalary: 28000,
    joiningDate: '2024-01-15',
    address: 'শ্রীপুর, গাজীপুর',
    status: 'ACTIVE',
  },
  {
    _id: 'emp-002',
    name: 'রফিকুল ইসলাম',
    phone: '01818-445566',
    role: 'হিসাবরক্ষক',
    monthlySalary: 22000,
    joiningDate: '2024-06-01',
    address: 'জয়দেবপুর, গাজীপুর',
    status: 'ACTIVE',
  },
  {
    _id: 'emp-003',
    name: 'কামাল উদ্দিন',
    phone: '01912-778899',
    role: 'ফিড ও শেড সুপারভাইজার',
    monthlySalary: 16000,
    joiningDate: '2024-03-10',
    address: 'মাওনা, গাজীপুর',
    status: 'ACTIVE',
  },
];

// 21. Mock Audit Logs
export const mockAuditLogs: IAuditLog[] = [
  {
    _id: 'log-001',
    userUid: 'demo-owner-101',
    userName: 'মোহাম্মদ আওলাদ হোসেন (মালিক)',
    userRole: 'OWNER',
    action: 'LOGIN',
    module: 'AUTH',
    details: 'সিস্টেমে ডেমো মোডে লগইন করেছেন',
    timestamp: new Date().toISOString(),
  },
  {
    _id: 'log-002',
    userUid: 'demo-manager-101',
    userName: 'ফারুক আহমেদ (ম্যানেজার)',
    userRole: 'MANAGER',
    action: 'CREATE',
    module: 'DAILY_ENTRY',
    details: 'শেড ১ এর আজকের ডিম ও খাদ্য রেকর্ড যুক্ত করা হয়েছে',
    timestamp: new Date().toISOString(),
  },
];

// 22. Mock Chart Data (7-Day Production Trend)
export const mockChartData = (() => {
  const list = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().split('T')[0];
    const parts = day.split('-');
    list.push({
      date: `${parts[2]}/${parts[1]}`,
      fullDate: day,
      eggs: Math.floor(5200 + Math.sin(i) * 220 + (6 - i) * 35),
      feedKg: Math.floor(715 + Math.cos(i) * 15),
      mortality: Math.floor(2 + (i % 3)),
    });
  }
  return list;
})();

// 23. Mock Dashboard Master Object
export const mockDashboardData = {
  overview: {
    totalSheds: mockSheds.length,
    activeFlocks: mockFlocks.length,
    currentBirdPopulation: mockFlocks.reduce((sum, f) => sum + f.currentBirdCount, 0),
    todayEggs: 5415,
    todayGoodEggs: 5355,
    todayBrokenEggs: 60,
    todayFeedKg: 720,
    todayMortality: 3,
    eggProductionRate: 90.25,
    eggInventory: mockEggInventory,
    currentFeedStockKg: mockFeedItems.reduce((sum, f) => sum + f.currentStockKg, 0),
  },
  finance: {
    todaySalesAmount: 77000,
    todayExpenseAmount: 168000,
    totalMonthlyIncome: 745000,
    totalMonthlyExpense: 520000,
    estimatedNetProfit: 225000,
    customerReceivables: 47000,
    supplierPayables: 53000,
  },
  chartData: mockChartData,
  notifications: mockNotifications,
  settings: mockSettings,
};

// 24. Endpoint Mapping Registry
export const mockDataRegistry: Record<string, unknown> = {
  '/api/auth/me': { user: mockCurrentUser },
  '/api/dashboard': mockDashboardData,
  '/api/sheds': mockSheds,
  '/api/flocks': mockFlocks,
  '/api/daily-entry': mockDailyEntries,
  '/api/eggs/inventory': mockEggInventory,
  '/api/sales': mockSales,
  '/api/customers': mockCustomers,
  '/api/customers/payments': mockCustomerPayments,
  '/api/suppliers': mockSuppliers,
  '/api/feed': mockFeedItems,
  '/api/feed/purchases': mockFeedPurchases,
  '/api/health/medicines': mockMedicines,
  '/api/health/vaccinations': mockVaccinations,
  '/api/health/mortality': mockMortality,
  '/api/finance/summary': mockFinanceSummary,
  '/api/finance/expenses': mockExpenses,
  '/api/finance/income': mockIncomes,
  '/api/notifications': mockNotifications,
  '/api/settings': mockSettings,
  '/api/employees': mockEmployees,
  '/api/audit-logs': mockAuditLogs,
};

/**
 * Find mock data matching an endpoint or URL path.
 * Supports query parameters by matching the base pathname.
 */
export function getMockDataForEndpoint<T = unknown>(endpoint: string): T | undefined {
  if (!endpoint) return undefined;

  // Strip query parameters
  const cleanPath = endpoint.split('?')[0].trim();

  // Special handling for dynamic /api/auth/me based on active selected role
  if (cleanPath === '/api/auth/me') {
    return { user: getActiveMockUser() } as T;
  }

  // 1. Direct match
  if (cleanPath in mockDataRegistry) {
    return mockDataRegistry[cleanPath] as T;
  }

  // 2. Prefix matching for sub-resources or dynamic IDs
  for (const [key, val] of Object.entries(mockDataRegistry)) {
    if (cleanPath === key || cleanPath.startsWith(`${key}/`)) {
      return val as T;
    }
  }

  return undefined;
}
