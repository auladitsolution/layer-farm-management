export type UserRole = 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'INVENTORY_MANAGER' | 'STAFF';

export interface IUser {
  _id?: string;
  uid: string; // Firebase UID
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IFarm {
  _id?: string;
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  photoUrl?: string;
  establishedDate?: string | Date;
  licenseNumber?: string;
}

export type ShedType = 'LAYER' | 'GROWER' | 'BROODER' | 'GENERAL';
export type ShedStatus = 'ACTIVE' | 'EMPTY' | 'MAINTENANCE' | 'CLEANING';

export interface IShed {
  _id?: string;
  name: string;
  code: string;
  capacity: number;
  currentOccupancy?: number;
  type: ShedType;
  status: ShedStatus;
  notes?: string;
  photoUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type FlockStatus = 'ACTIVE' | 'CULLED' | 'SOLD' | 'CLOSED';

export interface IFlock {
  _id?: string;
  batchId: string;
  name: string;
  breed: string; // e.g. "হাইল্যাইন ব্রাউন" / "লোহম্যান"
  supplier: string;
  shedId: string;
  shedName?: string;
  arrivalDate: string | Date;
  ageInWeeksAtArrival: number;
  initialBirdCount: number;
  currentBirdCount: number;
  purchaseCostPerBird: number;
  totalPurchaseCost: number;
  status: FlockStatus;
  notes?: string;
  closedDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IDailyEntry {
  _id?: string;
  date: string; // YYYY-MM-DD
  shedId: string;
  shedName?: string;
  flockId: string;
  flockName?: string;
  openingBirdCount: number;
  
  // Eggs
  totalEggs: number;
  goodEggs: number;
  brokenEggs: number;
  dirtyEggs: number;
  rejectedEggs: number;
  
  // Feed & Water
  feedConsumedKg: number;
  waterLiters?: number;
  
  // Mortality & Culling
  mortalityCount: number;
  culledCount: number;
  closingBirdCount: number;
  
  // Calculated Indicators
  eggProductionPercentage: number; // (totalEggs / openingBirdCount) * 100
  mortalityPercentage: number; // (mortalityCount / openingBirdCount) * 100
  feedPerBirdGrams: number; // (feedConsumedKg * 1000) / openingBirdCount
  
  temperatureCelsius?: number;
  notes?: string;
  recordedByUid?: string;
  recordedByName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IEggInventory {
  _id?: string;
  totalPieces: number;
  goodPieces: number;
  brokenPieces: number;
  dirtyPieces: number;
  lastUpdated: string | Date;
}

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'BANK' | 'OTHER';

export interface ICustomer {
  _id?: string;
  name: string;
  businessName?: string;
  phone: string;
  address?: string;
  openingBalance: number; // Positive = Due to us, Negative = Advance from customer
  currentDue: number;
  totalPurchases: number;
  totalPaid: number;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IEggSale {
  _id?: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  
  // Quantities
  unitType: 'PIECE' | 'DOZEN' | 'TRAY';
  quantityInUnit: number;
  conversionRateToPieces: number; // e.g., 30 for 1 tray
  totalPieces: number;
  
  unitPrice: number; // price per unit (tray/dozen/piece)
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedByUid?: string;
  recordedByName?: string;
  createdAt?: string | Date;
}

export interface ICustomerPayment {
  _id?: string;
  receiptNo: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  receivedByUid?: string;
  receivedByName?: string;
  createdAt?: string | Date;
}

export interface ISupplier {
  _id?: string;
  name: string;
  companyName?: string;
  phone: string;
  address?: string;
  category: 'FEED' | 'CHICKS' | 'MEDICINE' | 'EQUIPMENT' | 'OTHER';
  openingBalance: number;
  currentPayable: number;
  totalPurchases: number;
  totalPaid: number;
  createdAt?: string | Date;
}

export interface IFeedItem {
  _id?: string;
  name: string;
  type: 'STARTER' | 'GROWER' | 'LAYER_1' | 'LAYER_2' | 'CUSTOM';
  brand: string;
  unit: string; // e.g. "কেজি" / "ব্যাগ"
  bagWeightKg: number; // e.g., 50 kg per bag
  currentStockKg: number;
  lowStockThresholdKg: number;
  averagePurchasePricePerKg: number;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IFeedPurchase {
  _id?: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  feedItemId: string;
  feedName: string;
  date: string;
  bagCount: number;
  totalKg: number;
  pricePerKg: number;
  subTotal: number;
  transportCost: number;
  discount: number;
  totalCost: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt?: string | Date;
}

export interface IMedicine {
  _id?: string;
  name: string;
  type: 'VACCINE' | 'ANTIBIOTIC' | 'VITAMIN' | 'DISINFECTANT' | 'DEWORMER' | 'OTHER';
  brand: string;
  unit: string; // e.g. 'ভায়াল', 'মিলি', 'গ্রাম', 'পিস'
  currentStock: number;
  lowStockThreshold: number;
  expiryDate?: string;
  notes?: string;
}

export interface IVaccinationSchedule {
  _id?: string;
  flockId: string;
  flockName: string;
  vaccineName: string;
  targetBirdAgeWeeks: number;
  scheduledDate: string;
  dose: string;
  route: 'EYE_DROP' | 'DRINKING_WATER' | 'INJECTION' | 'WING_WEB' | 'SPRAY';
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  administeredDate?: string;
  responsiblePerson?: string;
  notes?: string;
}

export interface IMortalityRecord {
  _id?: string;
  date: string;
  flockId: string;
  flockName: string;
  shedName?: string;
  deadCount: number;
  suspectedReason?: string;
  notes?: string;
  photoUrl?: string;
  recordedByUid?: string;
  createdAt?: string | Date;
}

export interface IExpense {
  _id?: string;
  date: string;
  category: 
    | 'FEED' 
    | 'MEDICINE' 
    | 'VACCINE' 
    | 'ELECTRICITY' 
    | 'WATER' 
    | 'GAS' 
    | 'TRANSPORT' 
    | 'LABOUR' 
    | 'SALARY' 
    | 'REPAIRS' 
    | 'EQUIPMENT' 
    | 'LITTER' 
    | 'BIOSECURITY' 
    | 'VETERINARY' 
    | 'MISCELLANEOUS';
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  supplierOrPayee?: string;
  receiptUrl?: string;
  notes?: string;
  recordedByUid?: string;
  createdAt?: string | Date;
}

export interface IIncome {
  _id?: string;
  date: string;
  source: 'EGG_SALES' | 'SPENT_HEN' | 'MANURE_LITTER' | 'FEED_BAGS' | 'OTHER';
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerOrPayer?: string;
  referenceId?: string;
  notes?: string;
  createdAt?: string | Date;
}

export interface IEmployee {
  _id?: string;
  name: string;
  phone: string;
  role: string;
  monthlySalary: number;
  joiningDate: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  photoUrl?: string;
}

export interface ISetting {
  _id?: string;
  farmName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  logoUrl?: string;
  currency: string; // "৳ BDT"
  traySize: number; // e.g. 30
  lowFeedThresholdKg: number;
  highMortalityThresholdPercent: number;
  medicineExpiryNoticeDays: number;
  enableGrading: boolean;
  updatedAt?: string | Date;
}

export interface IAuditLog {
  _id?: string;
  userUid: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ADJUSTMENT';
  module: string;
  recordId?: string;
  details: string;
  timestamp: string | Date;
}

export interface INotification {
  _id?: string;
  title: string;
  message: string;
  type: 'WARNING' | 'ALERT' | 'INFO' | 'SUCCESS';
  link?: string;
  isRead: boolean;
  createdAt: string | Date;
}
