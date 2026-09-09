import { UserProfile } from '../types';
import { initialProfile } from '../mockData';

export interface UserAccount {
  emailOrMobile: string;
  password: string;
  profile: UserProfile;
}

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    emailOrMobile: '0917 889 2010',
    password: 'Test#1234',
    profile: {
      ...initialProfile,
      idNumber: 'SC-2024-008912',
      mobile: '0917 889 2010',
    },
  },
  {
    emailOrMobile: '0918 555 4321',
    password: 'Test#1234',
    profile: {
      id: 'usr_pwd_002',
      name: 'TERESA M. ALCANTARA',
      idNumber: 'PWD-2024-041920',
      idType: 'pwd',
      dob: '1982-04-19',
      expiryDate: '12/2027',
      status: 'ACTIVE',
      address: '45 Aurora Blvd, Quezon City, Metro Manila',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      mobile: '0918 555 4321',
      emergencyContactName: 'Manuel Alcantara (Spouse)',
      emergencyContactPhone: '0917 111 2233',
      emergencyRelation: 'Spouse',
    },
  },
];

const STORAGE_KEY = 'kaagapay_registered_accounts';

export const loadStoredAccounts = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const validAccounts: UserAccount[] = parsed
        .filter((acc) => acc && typeof acc === 'object')
        .map((acc) => ({
          emailOrMobile: acc.emailOrMobile || '',
          password: acc.password || 'Test#1234',
          profile: {
            ...initialProfile,
            ...(acc.profile || {}),
            name: acc.profile?.name || initialProfile.name,
            idNumber: acc.profile?.idNumber || initialProfile.idNumber,
          },
        }));

      // Ensure the default account is always present with Test#1234
      const hasDefault = validAccounts.some(
        (a) => normalizeCredential(a.emailOrMobile) === normalizeCredential('0917 889 2010')
      );
      if (!hasDefault) {
        return [...DEFAULT_ACCOUNTS, ...validAccounts];
      }
      return validAccounts;
    }
    return DEFAULT_ACCOUNTS;
  } catch (err) {
    console.error('Error loading stored accounts', err);
    return DEFAULT_ACCOUNTS;
  }
};

export const saveStoredAccounts = (accounts: UserAccount[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving accounts', err);
  }
};

export const normalizeCredential = (str: string): string => {
  if (!str) return '';
  return str.trim().replace(/[\s\-()]/g, '').toLowerCase();
};

export const authenticateUser = (
  identifier: string,
  pass: string,
  accounts: UserAccount[]
): { success: boolean; account?: UserAccount; error?: string } => {
  const normInput = normalizeCredential(identifier);
  if (!normInput) {
    return { success: false, error: 'Please enter your Mobile Number or ID Number.' };
  }
  if (!pass) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Find account by mobile, email, or official ID number
  const matchedAccount = (accounts || []).find((acc) => {
    if (!acc) return false;
    const normMobile = acc.emailOrMobile ? normalizeCredential(acc.emailOrMobile) : '';
    const normIdNumber = acc.profile?.idNumber ? normalizeCredential(acc.profile.idNumber) : '';
    return (normMobile && normMobile === normInput) || (normIdNumber && normIdNumber === normInput);
  });

  if (!matchedAccount) {
    return {
      success: false,
      error: 'Unregistered account. Please check your Mobile/ID Number or register a new account.',
    };
  }

  if (matchedAccount.password !== pass) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.',
    };
  }

  return { success: true, account: matchedAccount };
};
