import { ImportResult } from '@/types/crm';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function importCSV(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BACKEND_URL}/api/import`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}
