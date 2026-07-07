import { Request, Response } from 'express';
import busboy from 'busboy';
import { parseCSV } from '../services/csvParser';
import { processRecords } from '../services/batchProcessor';
import { log } from '../utils/logger';

export async function handleImport(req: Request, res: Response): Promise<void> {
  const bb = busboy({ headers: req.headers });
  let fileFound = false;
  let hasSentResponse = false;

  bb.on('file', async (name, fileStream, info) => {
    if (name !== 'file') {
      fileStream.resume();
      return;
    }

    if (!info.filename.toLowerCase().endsWith('.csv')) {
      fileStream.resume();
      if (!hasSentResponse) {
        hasSentResponse = true;
        res.status(400).json({ success: false, error: 'File must be a CSV' });
      }
      return;
    }

    fileFound = true;
    log('info', `Import stream started: file=${info.filename}`);

    try {
      const rawRecords = await parseCSV(fileStream);

      if (rawRecords.length === 0) {
        if (!hasSentResponse) {
          hasSentResponse = true;
          res.status(400).json({ success: false, error: 'CSV file is empty or has no valid rows' });
        }
        return;
      }

      log('info', `Stream parsed ${rawRecords.length} raw records`);
      const result = await processRecords(rawRecords);

      if (!hasSentResponse) {
        hasSentResponse = true;
        res.json(result);
      }
    } catch (error: unknown) {
      if (!hasSentResponse) {
        hasSentResponse = true;
        const message = error instanceof Error ? error.message : 'Unknown error';
        log('error', `Import stream failed: ${message}`);
        res.status(500).json({ success: false, error: `Import failed: ${message}` });
      }
    }
  });

  bb.on('finish', () => {
    if (!fileFound && !hasSentResponse) {
      hasSentResponse = true;
      res.status(400).json({ success: false, error: 'No file uploaded' });
    }
  });

  req.pipe(bb);
}
