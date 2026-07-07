import Papa from 'papaparse';

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export function parseCSVClient(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => v.trim(),
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const headers = results.meta.fields || [];
        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      },
      error: (err) => reject(err),
    });
  });
}
