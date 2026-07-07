export interface CRMRecord {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}

export interface SkippedRecord {
  index: number;
  reason: string;
  rawData?: Record<string, string>;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  records: CRMRecord[];
  skippedRecords: SkippedRecord[];
}

export type AppStep = 'upload' | 'preview' | 'processing' | 'results';

export const CRM_FIELD_LABELS: Record<keyof CRMRecord, string> = {
  created_at: 'Created At',
  name: 'Name',
  email: 'Email',
  country_code: 'Code',
  mobile_without_country_code: 'Mobile',
  company: 'Company',
  city: 'City',
  state: 'State',
  country: 'Country',
  lead_owner: 'Lead Owner',
  crm_status: 'Status',
  crm_note: 'Notes',
  data_source: 'Source',
  possession_time: 'Possession',
  description: 'Description',
};
