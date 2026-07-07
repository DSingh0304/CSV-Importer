import { CRMRecord, CRMStatus, DataSource, SkippedRecord } from '../types';

const ALLOWED_CRM_STATUSES: CRMStatus[] = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

const ALLOWED_DATA_SOURCES: DataSource[] = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

export function validateCRMStatus(value: string | undefined): CRMStatus {
  if (!value) return '';
  const normalized = value.trim().toUpperCase() as CRMStatus;
  return ALLOWED_CRM_STATUSES.includes(normalized) ? normalized : '';
}

export function validateDataSource(value: string | undefined): DataSource {
  if (!value) return '';
  const normalized = value.trim().toLowerCase() as DataSource;
  return ALLOWED_DATA_SOURCES.includes(normalized) ? normalized : '';
}

export function sanitizeRecord(record: CRMRecord): CRMRecord {
  return {
    ...record,
    crm_status: validateCRMStatus(record.crm_status),
    data_source: validateDataSource(record.data_source),
    created_at: sanitizeDate(record.created_at),
    mobile_without_country_code: sanitizeMobile(record.mobile_without_country_code),
    country_code: sanitizeCountryCode(record.country_code),
  };
}

function sanitizeDate(value: string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toISOString();
}

function sanitizeMobile(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/[\s\-\(\)]/g, '');
}

function sanitizeCountryCode(value: string | undefined): string {
  if (!value) return '';
  const code = value.trim();
  return code.startsWith('+') ? code : `+${code}`;
}

export function isValidRecord(record: CRMRecord): boolean {
  const hasEmail = !!(record.email && record.email.trim());
  const hasMobile = !!(record.mobile_without_country_code && record.mobile_without_country_code.trim());
  return hasEmail || hasMobile;
}

export function buildSkipReason(record: CRMRecord): string {
  const missing: string[] = [];
  if (!record.email?.trim()) missing.push('email');
  if (!record.mobile_without_country_code?.trim()) missing.push('mobile number');
  return `Missing required fields: ${missing.join(' and ')}`;
}
