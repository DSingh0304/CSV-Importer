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
  crm_status?: CRMStatus;
  crm_note?: string;
  data_source?: DataSource;
  possession_time?: string;
  description?: string;
}

export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE'
  | '';

export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots'
  | '';

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

export interface AIBatchResult {
  records: CRMRecord[];
  skipped: SkippedRecord[];
}
