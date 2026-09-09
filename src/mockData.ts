import { UserProfile, Transaction, NearbyStore, NotificationItem } from './types';

export const initialProfile: UserProfile = {
  id: 'usr_001',
  name: 'ROBERTO D. EVANGELISTA',
  idNumber: 'SC-2024-008912',
  idType: 'senior',
  dob: '1954-08-12',
  expiryDate: '12/2029',
  status: 'ACTIVE',
  address: '1024 Loyola St, Sampaloc, Manila, Metro Manila',
  photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
  mobile: '0917 889 2010',
  emergencyContactName: 'Clara Evangelista (Daughter)',
  emergencyContactPhone: '0918 555 1234',
  emergencyRelation: 'Daughter',
};

export const initialTransactions: Transaction[] = [
  {
    id: 'tx_001',
    storeName: 'Mercury Drug',
    category: 'pharmacy',
    amountSaved: 142.00,
    originalPaid: 568.00,
    date: 'Oct 24, 2023',
    time: '2:15 PM',
    timestamp: Date.now() - 3600000 * 2,
    receiptNumber: 'MD-8820192',
    notes: 'Maintenance medicine purchase (Amlodipine & Metformin)'
  },
  {
    id: 'tx_002',
    storeName: 'SM Supermarket',
    category: 'grocery',
    amountSaved: 320.50,
    originalPaid: 1282.00,
    date: 'Oct 22, 2023',
    time: '10:30 AM',
    timestamp: Date.now() - 3600000 * 48,
    receiptNumber: 'SM-551029',
    notes: 'Weekly groceries basic necessities'
  },
  {
    id: 'tx_003',
    storeName: 'LRT-2 Station',
    category: 'transport',
    amountSaved: 7.00,
    originalPaid: 28.00,
    date: 'Oct 21, 2023',
    time: '8:45 AM',
    timestamp: Date.now() - 3600000 * 72,
    receiptNumber: 'LRTA-0012',
    notes: 'Single journey ticket to Recto'
  },
  {
    id: 'tx_004',
    storeName: 'Jollibee',
    category: 'dining',
    amountSaved: 45.00,
    originalPaid: 180.00,
    date: 'Oct 20, 2023',
    time: '12:15 PM',
    timestamp: Date.now() - 3600000 * 96,
    receiptNumber: 'JB-998201',
    notes: '1-pc Chickenjoy with Rice & Soup'
  },
  {
    id: 'tx_005',
    storeName: 'Watsons Pharmacy',
    category: 'pharmacy',
    amountSaved: 88.20,
    originalPaid: 352.80,
    date: 'Oct 19, 2023',
    time: '4:30 PM',
    timestamp: Date.now() - 3600000 * 120,
    receiptNumber: 'WAT-441209',
    notes: 'Vitamin C & Calcium supplements'
  }
];

export const mockNearbyStores: NearbyStore[] = [
  {
    id: 'st_01',
    name: 'Mercury Drug - España Branch',
    category: 'pharmacy',
    discountInfo: '20% Senior/PWD + 12% VAT Exempt',
    distance: '0.3 km away',
    address: 'España Blvd cor. Lerma St, Manila',
    isVerifiedPartner: true,
    hours: 'Open 24/7',
    discountRate: 0.20
  },
  {
    id: 'st_02',
    name: 'SM Supermarket - San Lazaro',
    category: 'grocery',
    discountInfo: '5% Off Basic Necessities & Commodities',
    distance: '0.8 km away',
    address: 'Felix Huertas Road, Santa Cruz, Manila',
    isVerifiedPartner: true,
    hours: '8:00 AM - 9:00 PM',
    discountRate: 0.05
  },
  {
    id: 'st_03',
    name: 'Watsons Pharmacy - SM Manila',
    category: 'pharmacy',
    discountInfo: '20% Discount + 12% VAT Exemption',
    distance: '0.5 km away',
    address: 'Ground Floor, SM City Manila',
    isVerifiedPartner: true,
    hours: '10:00 AM - 9:00 PM',
    discountRate: 0.20
  },
  {
    id: 'st_04',
    name: 'Jollibee - Sampaloc Plaza',
    category: 'dining',
    discountInfo: '20% Personal Food Discount + VAT Exempt',
    distance: '0.4 km away',
    address: 'Earnshaw St, Sampaloc, Manila',
    isVerifiedPartner: true,
    hours: 'Open 24/7',
    discountRate: 0.20
  },
  {
    id: 'st_05',
    name: 'LRT-2 Legarda Station',
    category: 'transport',
    discountInfo: '20% Fare Discount + Priority Lane Access',
    distance: '1.2 km away',
    address: 'Legarda St, Sampaloc, Manila',
    isVerifiedPartner: true,
    hours: '5:00 AM - 10:00 PM',
    discountRate: 0.20
  },
  {
    id: 'st_06',
    name: 'Southstar Drug Store',
    category: 'pharmacy',
    discountInfo: '20% Discount + 12% VAT Exemption',
    distance: '1.5 km away',
    address: 'Dapitan St, Sampaloc, Manila',
    isVerifiedPartner: true,
    hours: '7:00 AM - 10:00 PM',
    discountRate: 0.20
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'nt_01',
    title: 'Discount Applied Successfully',
    message: 'Your 20% Senior Citizen discount (₱142.00) was verified at Mercury Drug.',
    time: '2 hours ago',
    read: false,
    type: 'discount'
  },
  {
    id: 'nt_02',
    title: 'Digital Wallet Update',
    message: 'Medicine subsidy program is now linked to your KaagapayID account.',
    time: 'Yesterday',
    read: false,
    type: 'system'
  },
  {
    id: 'nt_03',
    title: 'Hotline Contact Verified',
    message: 'Priority assistance hotline 1-800-KAAGAPAY is available 24/7.',
    time: '3 days ago',
    read: true,
    type: 'emergency'
  }
];

export const initialMedicinePurchases = [
  {
    id: 'med_01',
    pharmacyName: 'Mercury Drug - España Branch',
    medicineName: 'Amlodipine Besylate 10mg (Maintenance)',
    dosageQty: '30 tablets',
    purchaseDate: '2026-08-01',
    amountPaid: 480.00,
    discountReceived: 120.00,
    originalPrice: 600.00,
    doctorName: 'Dr. Maria Santos, MD',
  },
  {
    id: 'med_02',
    pharmacyName: 'Watsons Pharmacy - SM Manila',
    medicineName: 'Metformin HCl 500mg (Glucophage)',
    dosageQty: '60 tablets',
    purchaseDate: '2026-07-28',
    amountPaid: 352.80,
    discountReceived: 88.20,
    originalPrice: 441.00,
    doctorName: 'Dr. Jose Reyes, MD',
  },
  {
    id: 'med_03',
    pharmacyName: 'Southstar Drug Store - Sampaloc',
    medicineName: 'Losartan Potassium 50mg',
    dosageQty: '30 tablets',
    purchaseDate: '2026-07-20',
    amountPaid: 320.00,
    discountReceived: 80.00,
    originalPrice: 400.00,
    doctorName: 'Dr. Maria Santos, MD',
  },
  {
    id: 'med_04',
    pharmacyName: 'Generika Drugstore - Legarda',
    medicineName: 'Multivitamins + Minerals for Seniors',
    dosageQty: '30 capsules',
    purchaseDate: '2026-07-15',
    amountPaid: 210.00,
    discountReceived: 52.50,
    originalPrice: 262.50,
  }
];

export const initialAppointments = [
  {
    id: 'app_01',
    hospitalName: 'Philippine General Hospital (PGH)',
    doctorName: 'Dr. Maria Santos, MD',
    specialty: 'Cardiology Check-up',
    appointmentDate: '2026-08-12',
    appointmentTime: '09:00 AM',
    reminderStatus: 'Active' as const,
    reminderTimeBefore: '1 hour before',
    location: 'OPD Building Room 204, Taft Ave, Manila',
    notes: 'Bring previous ECG result and current prescription Booklet.'
  },
  {
    id: 'app_02',
    hospitalName: 'Manila Doctors Hospital',
    doctorName: 'Dr. Jose Reyes, MD',
    specialty: 'Endocrinology / Diabetes Consult',
    appointmentDate: '2026-08-20',
    appointmentTime: '02:00 PM',
    reminderStatus: 'Active' as const,
    reminderTimeBefore: '2 hours before',
    location: 'Suite 502, UN Avenue, Ermita, Manila',
    notes: 'Fasting blood sugar laboratory tests required before appointment.'
  },
  {
    id: 'app_03',
    hospitalName: 'Sampaloc Health Center',
    doctorName: 'Dr. Elena Cruz',
    specialty: 'Routine Senior Wellness & Vitals',
    appointmentDate: '2026-08-28',
    appointmentTime: '10:30 AM',
    reminderStatus: 'Muted' as const,
    reminderTimeBefore: '30 mins before',
    location: 'Main Health Center, Bustillos St, Manila',
    notes: 'Free maintenance medicine voucher distribution.'
  }
];

export const mockBenefitsList = [
  {
    id: 'ben_01',
    title: '20% Discount & 12% VAT Exemption',
    lawReference: 'RA 9994 (Senior Citizens Act) & RA 10754 (PWD Act)',
    discountRate: '20% + 12% VAT Exempt',
    icon: 'percent',
    summary: 'Mandatory 20% discount plus 12% Value Added Tax (VAT) exemption on medicines, dining, medical services, and transport.',
    description: 'All Senior Citizens (60yo+) and Persons with Disability (PWD) in the Philippines are entitled to a mandatory 20% discount and complete 12% VAT exemption on qualified goods and services nationwide.',
    eligibleItems: [
      'Prescription and OTC medicines, vaccines, and medical vitamins',
      'Doctor consultation fees and laboratory / diagnostic tests',
      'Food & beverages at restaurants and fast food for personal consumption',
      'Domestic air, sea, rail (LRT/MRT/PNR), jeepneys, and buses',
      'Hotels, resorts, theaters, cinemas, and recreation centers'
    ],
    howToClaim: [
      'Present your physical or digital KaagapayID at the cashier before billing.',
      'For medicine purchases, present doctor prescription booklet or valid RX.',
      'Ensure the receipt explicitly reflects 20% discount & 12% VAT deduction.'
    ],
    requiredDocs: ['KaagapayID / Official Senior or PWD Card', 'Purchase Booklet / Prescription'],
    category: 'Discount' as const
  },
  {
    id: 'ben_02',
    title: '5% Off Grocery & Basic Necessities',
    lawReference: 'DTI-DA Joint Administrative Order',
    discountRate: '5% Weekly',
    icon: 'shopping_cart',
    summary: 'Special 5% discount on basic necessities and prime commodities up to ₱1,500 weekly total.',
    description: 'Enjoy 5% discount when buying staple food items and household essentials in accredited supermarkets and grocery stores.',
    eligibleItems: [
      'Rice, corn, bread, fresh eggs, canned fish, and fresh meat/poultry',
      'Fresh milk, coffee, laundry soap, bottled water, and candles',
      'Local agricultural produce and fresh vegetables'
    ],
    howToClaim: [
      'Present KaagapayID together with your LGU Senior/PWD Purchase Booklet.',
      'Discount applies up to ₱1,500 total weekly cap across purchases.'
    ],
    requiredDocs: ['KaagapayID', 'Senior/PWD Purchase Booklet'],
    category: 'Discount' as const
  },
  {
    id: 'ben_03',
    title: 'Transportation & Express Lane Access',
    lawReference: 'DOTr & LTFRB Guidelines',
    discountRate: '20% Fare Discount',
    icon: 'directions_bus',
    summary: '20% discount on all public transport, Grab, LRT/MRT, plus priority express lane privileges.',
    description: 'Seniors and PWDs are granted 20% fare discount across all public transportation, domestic airfare, passenger ships, and ride-hailing services. Transport hubs must provide designated priority seating and express lanes.',
    eligibleItems: [
      'LRT-1, LRT-2, MRT-3, and PNR trains',
      'Public utility buses, jeepneys, UV Express, and taxis',
      'Grab / Transport Network Vehicle Services (TNVS)',
      'Domestic airline flights and inter-island passenger ferries'
    ],
    howToClaim: [
      'Present KaagapayID at ticket counters or load priority Beep cards.',
      'Link Senior/PWD ID details in transport apps (e.g. Grab) for automatic discount.'
    ],
    requiredDocs: ['KaagapayID'],
    category: 'Discount' as const
  },
  {
    id: 'ben_04',
    title: 'Free Hospital Care & PhilHealth Coverage',
    lawReference: 'Universal Health Care Act & RA 10645',
    discountRate: '100% PhilHealth Mandatory',
    icon: 'local_hospital',
    summary: 'Automatic PhilHealth coverage for all Senior Citizens & PWDs in government hospitals.',
    description: 'All senior citizens and PWDs are automatically covered by PhilHealth, granting free or heavily subsidized ward stay, diagnostic testing, and emergency treatments in DOH government hospitals.',
    eligibleItems: [
      'In-patient and out-patient medical care in public hospitals',
      'Free consultations in LGU health centers',
      'Discounted diagnostic imaging (X-Ray, CT Scan, MRI, Ultrasound)',
      'Dental services and minor surgery procedures'
    ],
    howToClaim: [
      'Present KaagapayID upon admission or triage in public health facilities.',
      'PhilHealth verification is handled automatically by hospital social workers.'
    ],
    requiredDocs: ['KaagapayID', 'PhilHealth ID / MDR (if available)'],
    category: 'Exemption' as const
  },
  {
    id: 'ben_05',
    title: 'Social Pension for Indigent Seniors',
    lawReference: 'RA 11916 (Social Pension Law)',
    discountRate: '₱1,000 / month',
    icon: 'payments',
    summary: 'Monthly stipend of ₱1,000 for indigent Senior Citizens distributed quarterly by DSWD.',
    description: 'Indigent senior citizens who are frail, sick, or without permanent source of income or regular support from relatives receive a monthly financial stipend of ₱1,000 (₱3,000 per quarter).',
    eligibleItems: [
      'Quarterly cash payouts (₱3,000 every 3 months)',
      'Direct bank transfer / LGU payout centers'
    ],
    howToClaim: [
      'Apply at your municipal/city OSCA (Office for Senior Citizens Affairs).',
      'Undergo DSWD social worker assessment and eligibility verification.'
    ],
    requiredDocs: ['KaagapayID', 'Barangay Certificate of Indigency'],
    category: 'Assistance' as const
  },
  {
    id: 'ben_06',
    title: 'Local LGU Perks & Birthday Benefits',
    lawReference: 'Local Government Ordinance',
    discountRate: 'Free Benefits',
    icon: 'card_giftcard',
    summary: 'City-specific benefits including free movie admissions, birthday gifts, and wellness kits.',
    description: 'Many progressive LGUs (e.g., Manila, Quezon City, Makati, Pasig) provide special local ordinances such as free cinema entry, annual birthday cash gifts, and wellness care packages.',
    eligibleItems: [
      'Free cinema/movie admission on designated weekdays',
      'Annual LGU birthday cash gift or gift vouchers',
      'Free maintenance medicine delivery from barangay health centers',
      'Free flu & pneumococcal vaccination drives'
    ],
    howToClaim: [
      'Register your KaagapayID with your local barangay or OSCA/PDAO office.',
      'Present ID at accredited local cinema counters or LGU distribution centers.'
    ],
    requiredDocs: ['KaagapayID', 'Barangay ID / Proof of Residency'],
    category: 'Local' as const
  }
];

export const initialAssistanceUpdates = [
  {
    id: 'upd_01',
    title: 'Free Medical & Dental Mission for Seniors & PWDs',
    category: 'Medical Missions' as const,
    date: 'August 15, 2026',
    location: 'Sampaloc Barangay 526 Covered Court, Manila',
    summary: 'Free doctor consultations, blood pressure screening, fasting blood sugar test, and free maintenance medicines.',
    details: 'The City Government of Manila in partnership with NCSC is conducting a comprehensive medical mission. Free eyeglasses, dental checkups, and maintenance medicine supplies for 30 days will be distributed to validated cardholders.',
    isUrgent: true,
    isNew: true,
    organizer: 'Manila Health Department & NCSC',
    contactNumber: '(02) 8527-5112'
  },
  {
    id: 'upd_02',
    title: '3rd Quarter Social Pension Payout Schedule Announced',
    category: 'Pension Schedule' as const,
    date: 'August 18 - 22, 2026',
    location: 'District 4 OSCA Center, Earnshaw St, Manila',
    summary: 'Quarterly payout of ₱3,000 (July to September 2026) for eligible indigent senior citizens.',
    details: 'DSWD Region 4 and Manila OSCA announce the payout schedule for Q3 2026 Social Pension. Beneficiaries must bring their physical or digital KaagapayID and one photocopy. Authorized representatives must present an authorization letter.',
    isUrgent: false,
    isNew: true,
    organizer: 'DSWD Field Office & OSCA Manila',
    contactNumber: '0917-888-OSCA'
  },
  {
    id: 'upd_03',
    title: 'Free Pneumococcal & Annual Flu Vaccination Drive',
    category: 'Vaccination' as const,
    date: 'August 10 - 12, 2026',
    location: 'All Sampaloc Health Centers',
    summary: 'Protect against pneumonia and seasonal flu. Walk-ins accepted for verified KaagapayID holders.',
    details: 'Health centers across Sampaloc district will administer free single-dose pneumococcal vaccines and quadrivalent flu vaccines. Priority queuing is guaranteed for senior citizens and persons with disabilities.',
    isUrgent: false,
    isNew: false,
    organizer: 'DOH & Manila Health Services',
    contactNumber: '1-800-KAAGAPAY'
  },
  {
    id: 'upd_04',
    title: 'DTI Advisory: Strict Implementation of 20% Discount & VAT Exemption',
    category: 'Advisories' as const,
    date: 'August 01, 2026',
    location: 'Nationwide Stores & Restaurants',
    summary: 'DTI warns establishments refusing digital Senior/PWD ID cards. Violators face fines and permit suspension.',
    details: 'The Department of Trade and Industry (DTI) reiterates that digital IDs issued through official LGU platforms and KaagapayID carry equal legal weight as physical cards under RA 9994 and RA 10754.',
    isUrgent: false,
    isNew: false,
    organizer: 'Department of Trade and Industry (DTI)',
    contactNumber: '1-DTI (384)'
  },
  {
    id: 'upd_05',
    title: 'LGU Express Lane & Assistive Technology Registration',
    category: 'LGU Services' as const,
    date: 'Ongoing (Mon-Fri 8AM-5PM)',
    location: 'Manila City Hall Ground Floor, PDAO Desk',
    summary: 'Free registration for assistive devices (wheelchairs, hearing aids, canes) and priority lane stickers.',
    details: 'PDAO Manila offers free assessment for PWD members needing mobility devices and hearing assistive devices. Cardholders may also claim official vehicle priority parking stickers.',
    isUrgent: false,
    isNew: false,
    organizer: 'Persons with Disability Affairs Office (PDAO)',
    contactNumber: '(02) 8527-0012'
  }
];

export const initialVerificationLogs: import('./types').VerificationLog[] = [
  {
    id: 'vlog_01',
    timestamp: Date.now() - 3600000 * 2,
    date: '2026-08-26',
    time: '01:45 PM',
    idNumber: 'SC-2024-008912',
    name: 'ROBERTO D. EVANGELISTA',
    idType: 'senior',
    status: 'VALID',
    cashierName: 'Cashier Station #02 (Mercury Drug)',
    storeName: 'Mercury Drug - Sampaloc Branch',
    notes: 'Prescription maintenance drugs verified',
    amountBilled: 1250.00,
    discountApplied: 223.21,
    finalAmount: 892.86
  },
  {
    id: 'vlog_02',
    timestamp: Date.now() - 3600000 * 8,
    date: '2026-08-26',
    time: '09:12 AM',
    idNumber: 'PWD-2024-041920',
    name: 'Mark Anthony S. Inocencio',
    idType: 'pwd',
    status: 'VALID',
    cashierName: 'Counter #04 (SM Supermarket)',
    storeName: 'SM Supermarket Manila',
    notes: 'Weekly groceries basic necessities',
    amountBilled: 1300.00,
    discountApplied: 65.00,
    finalAmount: 1235.00
  },
  {
    id: 'vlog_03',
    timestamp: Date.now() - 3600000 * 24,
    date: '2026-08-25',
    time: '04:30 PM',
    idNumber: 'SC-2018-004122',
    name: 'Roberto E. Gomez',
    idType: 'senior',
    status: 'EXPIRED',
    cashierName: 'Ticket Booth (LRT-2)',
    storeName: 'LRTA Recto Station',
    notes: 'Pass expired on 2023-12-31, advised to renew with OSCA'
  }
];


