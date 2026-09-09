export type IDType = 'senior' | 'pwd';

export interface UserProfile {
  id: string;
  name: string;
  idNumber: string;
  idType: IDType;
  dob: string;
  expiryDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  address: string;
  photoUrl: string;
  mobile: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelation: string;
}

export type CategoryType = 'pharmacy' | 'grocery' | 'transport' | 'dining' | 'medical' | 'other';

export interface Transaction {
  id: string;
  storeName: string;
  category: CategoryType;
  amountSaved: number;
  originalPaid: number;
  date: string;
  time: string;
  timestamp: number;
  receiptNumber?: string;
  notes?: string;
}

export interface NearbyStore {
  id: string;
  name: string;
  category: CategoryType;
  discountInfo: string;
  distance: string;
  address: string;
  isVerifiedPartner: boolean;
  hours: string;
  discountRate: number; // e.g., 0.20 for 20%
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'discount' | 'system' | 'emergency';
}

export type ColorVisionMode = 'standard' | 'senior-clarity' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export type FontSizeScale = 'compact' | 'normal' | 'large' | 'xlarge' | 'huge';

export interface AccessibilitySettings {
  fontSize: FontSizeScale;
  highContrast: boolean;
  colorVisionMode?: ColorVisionMode;
  voiceReaderEnabled: boolean;
  soundAlerts: boolean;
  reducedMotion?: boolean;
  largeTouchTargets?: boolean;
  hapticFeedback?: boolean;
}

export interface MedicinePurchase {
  id: string;
  pharmacyName: string;
  medicineName: string;
  dosageQty?: string;
  purchaseDate: string;
  amountPaid: number;
  discountReceived: number;
  originalPrice: number;
  doctorName?: string;
}

export interface Appointment {
  id: string;
  hospitalName: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  reminderStatus: 'Active' | 'Muted' | 'Done';
  reminderTimeBefore?: string; // e.g., '1 hour before'
  notes?: string;
  location?: string;
}

export interface BenefitCategory {
  id: string;
  title: string;
  lawReference: string;
  discountRate: string;
  icon: string;
  summary: string;
  description: string;
  eligibleItems: string[];
  howToClaim: string[];
  requiredDocs: string[];
  category: 'Discount' | 'Exemption' | 'Assistance' | 'Local';
}

export interface AssistanceUpdate {
  id: string;
  title: string;
  category: 'Medical Missions' | 'Pension Schedule' | 'Vaccination' | 'LGU Services' | 'Advisories';
  date: string;
  location: string;
  summary: string;
  details: string;
  isUrgent?: boolean;
  isNew?: boolean;
  organizer: string;
  contactNumber?: string;
}

export type AppRole = 'user' | 'verifier';

export interface VerificationLog {
  id: string;
  timestamp: number;
  date: string;
  time: string;
  idNumber: string;
  name: string;
  idType: IDType;
  status: 'VALID' | 'EXPIRED' | 'UNAUTHORIZED' | 'INVALID';
  cashierName: string;
  storeName?: string;
  notes?: string;
  amountBilled?: number;
  discountApplied?: number;
  finalAmount?: number;
}

