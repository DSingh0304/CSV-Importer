import { CRMRecord, ImportResult, SkippedRecord } from '../types';
import { extractBatch } from './aiExtractor';
import { sanitizeRecord, isValidRecord, buildSkipReason } from '../utils/validators';
import { log } from '../utils/logger';

const BATCH_SIZE = 20;
const CONCURRENT_BATCHES = 3;

export async function processRecords(
  rawRecords: Record<string, string>[]
): Promise<ImportResult> {
  const batches: Record<string, string>[][] = [];
  for (let i = 0; i < rawRecords.length; i += BATCH_SIZE) {
    batches.push(rawRecords.slice(i, i + BATCH_SIZE));
  }

  log('info', `Processing ${rawRecords.length} records in ${batches.length} batches`);

  const allRecords: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];
  let globalOffset = 0;

  for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
    const concurrentBatch = batches.slice(i, i + CONCURRENT_BATCHES);
    const batchIndices = concurrentBatch.map((_, idx) => i + idx);

    const results = await Promise.allSettled(
      concurrentBatch.map((batch, idx) => extractBatch(batch, batchIndices[idx]))
    );

    for (let j = 0; j < results.length; j++) {
      const batchOffset = globalOffset + j * BATCH_SIZE;
      const result = results[j];

      if (result.status === 'fulfilled') {
        const { records, skipped } = result.value;

        for (const record of records) {
          const sanitized = sanitizeRecord(record);
          if (isValidRecord(sanitized)) {
            allRecords.push(sanitized);
          } else {
            allSkipped.push({
              index: batchOffset + records.indexOf(record),
              reason: buildSkipReason(sanitized),
              rawData: concurrentBatch[j][records.indexOf(record)],
            });
          }
        }

        for (const skip of skipped) {
          allSkipped.push({
            ...skip,
            index: batchOffset + skip.index,
          });
        }
      } else {
        log('error', `Batch ${batchIndices[j]} rejected: ${result.reason}`);
        const failedBatch = concurrentBatch[j];
        for (let k = 0; k < failedBatch.length; k++) {
          allSkipped.push({
            index: batchOffset + k,
            reason: 'Batch processing failed',
          });
        }
      }
    }

    globalOffset += concurrentBatch.length * BATCH_SIZE;
  }

  log('info', `Done. Imported=${allRecords.length}, Skipped=${allSkipped.length}`);

  return {
    success: true,
    imported: allRecords.length,
    skipped: allSkipped.length,
    records: allRecords,
    skippedRecords: allSkipped,
  };
}
