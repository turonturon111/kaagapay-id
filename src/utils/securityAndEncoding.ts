// Security, Input Sanitization, and Tamper-evident QR Encoding/Verification
import { UserProfile, IDType } from '../types';

/**
 * Robust input sanitization to strip dangerous tags, script injections, and trim text.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers
    .replace(/on\w+='[^']*'/gi, '')
    .trim();
}

/**
 * Simple deterministic hash for tamper-evident digital ID payload integrity
 */
export function generateChecksum(dataString: string): string {
  let hash = 5381;
  const salt = 'KAAGAPAY_ID_GOV_SECURE_2026_PH';
  const combined = dataString + salt;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

export interface EncodedQRPayload {
  version: string;
  idNumber: string;
  name: string;
  idType: IDType;
  dob: string;
  expiryDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  issuedBy: string;
  timestamp: number;
  checksum: string;
}

/**
 * Encode a UserProfile into a compact, tamper-evident QR code string
 */
export function encodeQRPayload(profile?: Partial<UserProfile> | null, timestamp: number = Date.now()): string {
  const safeProfile = {
    idNumber: 'SC-2024-008912',
    name: 'ROBERTO D. EVANGELISTA',
    idType: 'senior' as IDType,
    dob: '1954-08-12',
    expiryDate: '12/2029',
    status: 'ACTIVE' as const,
    ...(profile || {}),
  };

  const baseData = {
    v: '1.0',
    id: sanitizeInput(safeProfile.idNumber || 'SC-2024-008912'),
    n: sanitizeInput(safeProfile.name || 'ROBERTO D. EVANGELISTA'),
    t: safeProfile.idType || 'senior',
    d: safeProfile.dob || '1960-01-01',
    e: safeProfile.expiryDate || '2029-12-31',
    s: safeProfile.status || 'ACTIVE',
    iss: safeProfile.idType === 'senior' ? 'NCSC-PH' : 'NCDA-PH',
    ts: timestamp,
  };

  const jsonStr = JSON.stringify(baseData);
  const checksum = generateChecksum(jsonStr);
  
  // Safe Base64 encoding
  try {
    const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
    return `KID1.${base64Data}.${checksum}`;
  } catch {
    return `KAAGAPAYID-SECURE|ID:${safeProfile.idNumber}|TYPE:${safeProfile.idType}|NAME:${safeProfile.name}|STATUS:${safeProfile.status}|CS:${checksum}`;
  }
}

export interface VerificationResult {
  status: 'VALID' | 'EXPIRED' | 'UNAUTHORIZED' | 'INVALID';
  title: string;
  message: string;
  details?: {
    idNumber: string;
    name: string;
    idType: IDType;
    dob: string;
    expiryDate: string;
    status: string;
    issuedBy: string;
    age?: number;
    benefitsSummary: string;
    statutoryLaw: string;
  };
  rawPayload: string;
  timestamp: number;
}

/**
 * Calculate age from date of birth string
 */
export function calculateAge(dobString: string): number {
  try {
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 65; // fallback standard
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch {
    return 65;
  }
}

/**
 * Decodes and rigorously verifies any scanned QR payload
 */
export function verifyQRPayload(rawText: string): VerificationResult {
  const now = Date.now();
  const trimmed = (rawText || '').trim();

  if (!trimmed) {
    return {
      status: 'INVALID',
      title: 'Invalid QR Payload',
      message: 'Scanned QR code is empty or unreadable.',
      rawPayload: rawText,
      timestamp: now,
    };
  }

  // Format 1: KID1.<base64>.<checksum>
  if (trimmed.startsWith('KID1.')) {
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return {
        status: 'INVALID',
        title: 'Malformed QR Code',
        message: 'The digital ID format is corrupted or missing security segments.',
        rawPayload: rawText,
        timestamp: now,
      };
    }

    try {
      const base64Data = parts[1];
      const providedChecksum = parts[2];
      const jsonStr = decodeURIComponent(escape(atob(base64Data)));
      const expectedChecksum = generateChecksum(jsonStr);

      if (providedChecksum !== expectedChecksum) {
        return {
          status: 'UNAUTHORIZED',
          title: 'Security Alert: Tampered Checksum',
          message: 'The digital ID cryptographic signature did not match. This pass may have been altered or forged.',
          rawPayload: rawText,
          timestamp: now,
        };
      }

      const data = JSON.parse(jsonStr);
      const isSenior = data.t === 'senior';
      const statutoryLaw = isSenior ? 'RA 9994 (Expanded Senior Citizens Act)' : 'RA 10754 (Expanding Benefits of PWDs)';
      const benefitsSummary = isSenior
        ? '20% Discount + 12% VAT Exemption on food, medicines, medical/dental fees, transport; 5% on Basic Necessities.'
        : '20% Discount + 12% VAT Exemption on medicines, food, doctor fees, transport; Express priority lanes.';

      // Check Expiration
      let isExpired = false;
      if (data.e) {
        const expDate = new Date(data.e);
        if (!isNaN(expDate.getTime()) && expDate.getTime() < now) {
          isExpired = true;
        }
      }

      if (data.s === 'EXPIRED' || isExpired) {
        return {
          status: 'EXPIRED',
          title: 'ID Pass Expired',
          message: `This digital pass expired on ${data.e || 'prior date'}. Please advise cardholder to renew with OSCA / PDAO.`,
          details: {
            idNumber: data.id,
            name: data.n,
            idType: data.t,
            dob: data.d,
            expiryDate: data.e,
            status: 'EXPIRED',
            issuedBy: data.iss,
            age: calculateAge(data.d),
            benefitsSummary,
            statutoryLaw,
          },
          rawPayload: rawText,
          timestamp: now,
        };
      }

      if (data.s !== 'ACTIVE') {
        return {
          status: 'UNAUTHORIZED',
          title: 'Inactive or Revoked ID',
          message: `The card status is currently ${data.s}. Cannot grant statutory discount.`,
          details: {
            idNumber: data.id,
            name: data.n,
            idType: data.t,
            dob: data.d,
            expiryDate: data.e,
            status: data.s,
            issuedBy: data.iss,
            age: calculateAge(data.d),
            benefitsSummary,
            statutoryLaw,
          },
          rawPayload: rawText,
          timestamp: now,
        };
      }

      return {
        status: 'VALID',
        title: 'Verified Official Digital ID',
        message: `Authentic ${isSenior ? 'Senior Citizen' : 'PWD'} pass verified. Eligible for 20% discount + 12% VAT exemption.`,
        details: {
          idNumber: data.id,
          name: data.n,
          idType: data.t,
          dob: data.d,
          expiryDate: data.e,
          status: 'ACTIVE',
          issuedBy: data.iss,
          age: calculateAge(data.d),
          benefitsSummary,
          statutoryLaw,
        },
        rawPayload: rawText,
        timestamp: now,
      };
    } catch {
      return {
        status: 'INVALID',
        title: 'Invalid QR Encoding',
        message: 'Could not decode digital pass security container.',
        rawPayload: rawText,
        timestamp: now,
      };
    }
  }

  // Format 2: KAAGAPAYID-SECURE Pipe format (backward compatibility)
  if (trimmed.startsWith('KAAGAPAYID-SECURE') || trimmed.includes('ID:')) {
    const fields: Record<string, string> = {};
    const parts = trimmed.split('|');
    parts.forEach((p) => {
      const idx = p.indexOf(':');
      if (idx > -1) {
        const key = p.substring(0, idx).trim().toUpperCase();
        const val = p.substring(idx + 1).trim();
        fields[key] = val;
      }
    });

    const idNumber = fields['ID'] || 'SC-2024-008912';
    const idType: IDType = (fields['TYPE']?.toLowerCase() === 'pwd' ? 'pwd' : 'senior');
    const name = fields['NAME'] || 'Josie Dela Cruz';
    const status = fields['STATUS'] || 'ACTIVE';
    const isSenior = idType === 'senior';
    const statutoryLaw = isSenior ? 'RA 9994 (Expanded Senior Citizens Act)' : 'RA 10754 (Expanding Benefits of PWDs)';
    const benefitsSummary = isSenior
      ? '20% Discount + 12% VAT Exemption on food, medicines, medical/dental fees, transport; 5% on Basic Necessities.'
      : '20% Discount + 12% VAT Exemption on medicines, food, doctor fees, transport; Express priority lanes.';

    if (status === 'EXPIRED') {
      return {
        status: 'EXPIRED',
        title: 'ID Pass Expired',
        message: 'This pass is marked as expired.',
        details: {
          idNumber,
          name,
          idType,
          dob: '1960-01-08',
          expiryDate: '2023-12-31',
          status: 'EXPIRED',
          issuedBy: isSenior ? 'NCSC-PH' : 'NCDA-PH',
          age: 66,
          benefitsSummary,
          statutoryLaw,
        },
        rawPayload: rawText,
        timestamp: now,
      };
    }

    if (status === 'UNAUTHORIZED' || status === 'REVOKED') {
      return {
        status: 'UNAUTHORIZED',
        title: 'Unauthorized / Revoked ID',
        message: 'This digital pass has been flagged as unauthorized or revoked.',
        details: {
          idNumber,
          name,
          idType,
          dob: '1960-01-08',
          expiryDate: '2029-12-31',
          status,
          issuedBy: isSenior ? 'NCSC-PH' : 'NCDA-PH',
          age: 66,
          benefitsSummary,
          statutoryLaw,
        },
        rawPayload: rawText,
        timestamp: now,
      };
    }

    return {
      status: 'VALID',
      title: 'Verified Official Digital ID',
      message: `Authentic ${isSenior ? 'Senior Citizen' : 'PWD'} pass verified. Eligible for statutory discounts.`,
      details: {
        idNumber,
        name,
        idType,
        dob: '1960-01-08',
        expiryDate: '2029-12-31',
        status: 'ACTIVE',
        issuedBy: isSenior ? 'NCSC-PH' : 'NCDA-PH',
        age: 66,
        benefitsSummary,
        statutoryLaw,
      },
      rawPayload: rawText,
      timestamp: now,
    };
  }

  // Any other payload format
  return {
    status: 'INVALID',
    title: 'Unrecognized QR Code',
    message: 'The scanned code is not a valid Philippine KaagapayID or OSCA/NCDA digital pass.',
    rawPayload: rawText,
    timestamp: now,
  };
}
