import { describe, it, expect } from 'vitest';
import { 
  validateCRMStatus, 
  validateDataSource, 
  sanitizeRecord, 
  isValidRecord,
  buildSkipReason 
} from '../src/utils/validators';

describe('validators', () => {
  describe('validateCRMStatus', () => {
    it('returns the status if it is a valid enum', () => {
      expect(validateCRMStatus('GOOD_LEAD_FOLLOW_UP')).toBe('GOOD_LEAD_FOLLOW_UP');
      expect(validateCRMStatus('bad_lead')).toBe('BAD_LEAD');
    });

    it('returns empty string for invalid statuses', () => {
      expect(validateCRMStatus('RANDOM_STATUS')).toBe('');
      expect(validateCRMStatus('')).toBe('');
      expect(validateCRMStatus(undefined)).toBe('');
    });
  });

  describe('validateDataSource', () => {
    it('returns the data source if valid', () => {
      expect(validateDataSource('leads_on_demand')).toBe('leads_on_demand');
      expect(validateDataSource('MERIDIAN_TOWER')).toBe('meridian_tower');
    });

    it('returns empty string for invalid sources', () => {
      expect(validateDataSource('facebook')).toBe('');
    });
  });

  describe('sanitizeRecord', () => {
    it('sanitizes mobile numbers and country codes', () => {
      const record: any = {
        first_name: 'John',
        last_name: 'Doe',
        mobile_without_country_code: '(555) 123-4567',
        country_code: '1',
      };
      const sanitized = sanitizeRecord(record);
      expect(sanitized.mobile_without_country_code).toBe('5551234567');
      expect(sanitized.country_code).toBe('+1');
    });
  });

  describe('isValidRecord', () => {
    it('returns true if email is present', () => {
      expect(isValidRecord({ email: 'test@test.com' } as any)).toBe(true);
    });

    it('returns true if mobile is present', () => {
      expect(isValidRecord({ mobile_without_country_code: '123' } as any)).toBe(true);
    });

    it('returns false if both are missing', () => {
      expect(isValidRecord({ email: '', mobile_without_country_code: '  ' } as any)).toBe(false);
    });
  });

  describe('buildSkipReason', () => {
    it('returns reason when missing both', () => {
      expect(buildSkipReason({} as any)).toBe('Missing required fields: email and mobile number');
    });
  });
});
