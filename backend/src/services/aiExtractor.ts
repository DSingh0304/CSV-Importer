import { GoogleGenerativeAI } from '@google/generative-ai';
import { CRMRecord, AIBatchResult, SkippedRecord } from '../types';
import { log } from '../utils/logger';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are a CRM data extraction specialist for GrowEasy, a real estate CRM platform.
Your job is to analyze raw CSV records (provided as JSON objects with arbitrary column names) and intelligently map them to the GrowEasy CRM schema.

## Output Schema
Return ONLY a valid JSON object with this exact structure:
{
  "records": [...],
  "skipped": [{ "index": <number>, "reason": "<string>" }]
}

## CRM Fields to Extract
- created_at: Lead creation date. Must be parseable by JavaScript new Date(). Convert to ISO format if possible.
- name: Full name of the lead.
- email: Primary email address. If multiple found, use the first one.
- country_code: Country phone code with "+" prefix (e.g., "+91"). Infer from phone or context if missing.
- mobile_without_country_code: Mobile digits only, no spaces/dashes/country-code. If multiple, use first.
- company: Company or organization name.
- city: City name.
- state: State or province.
- country: Country name.
- lead_owner: Email or name of the person who owns this lead.
- crm_status: Lead status — MUST be one of exactly: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE.
  Infer intelligently: "interested"/"hot"/"follow up" → GOOD_LEAD_FOLLOW_UP, "busy"/"no answer"/"not reachable" → DID_NOT_CONNECT, "not interested"/"invalid"/"junk" → BAD_LEAD, "closed"/"converted"/"won" → SALE_DONE. Leave empty string if unclear.
- crm_note: Catch-all field. Include: remarks, follow-up notes, additional comments, extra phone numbers, extra email addresses, any other useful info that doesn't fit another field. Escape newlines as \\n.
- data_source: MUST be exactly one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Only set if confident from context. Otherwise leave as empty string "".
- possession_time: Property possession timeline if mentioned.
- description: Any additional description or context.

## Rules
1. Column names may vary wildly — use semantic understanding to map them (e.g., "Phone", "Mobile No.", "Contact" all map to mobile).
2. If a record has NEITHER a valid email NOR a mobile number, add it to "skipped" with a clear reason and do NOT include it in "records".
3. Multiple emails: use first in email field, append rest to crm_note with label "Additional emails: ...".
4. Multiple mobiles: use first in mobile_without_country_code, append rest to crm_note with label "Additional mobiles: ...".
5. crm_status and data_source must exactly match the allowed values or be empty string "". Never invent new values.
6. Keep each record as a flat object. No nested objects.
7. If a field cannot be determined, use empty string "" — never use null or undefined.
8. The "index" in "skipped" refers to the 0-based index within the batch you receive.

Return ONLY the JSON object. No markdown, no explanation, no code blocks.`;

export async function extractBatch(
  batch: Record<string, string>[],
  batchIndex: number,
  retryCount = 0
): Promise<AIBatchResult> {
  const maxRetries = 2;

  try {
    log('info', `Extracting batch ${batchIndex}, size=${batch.length}, attempt=${retryCount + 1}`);

    const prompt = `${SYSTEM_PROMPT}

## Input Records (batch of ${batch.length})
${JSON.stringify(batch, null, 2)}`;

    const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent(prompt);

    const text = response.response.text();
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned) as AIBatchResult;

    if (!Array.isArray(parsed.records) || !Array.isArray(parsed.skipped)) {
      throw new Error('Invalid AI response structure');
    }

    return parsed;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log('warn', `Batch ${batchIndex} failed (attempt ${retryCount + 1}): ${errorMessage}`);

    if (retryCount < maxRetries) {
      const delay = 500 * Math.pow(3, retryCount);
      await new Promise((r) => setTimeout(r, delay));
      return extractBatch(batch, batchIndex, retryCount + 1);
    }

    log('error', `Batch ${batchIndex} permanently failed after ${maxRetries + 1} attempts`);
    const skipped: SkippedRecord[] = batch.map((_, i) => ({
      index: i,
      reason: 'AI extraction failed after retries',
    }));
    return { records: [], skipped };
  }
}
