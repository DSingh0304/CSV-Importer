'use client';

import { useEffect, useState } from 'react';
import styles from './ProcessingState.module.css';

const MESSAGES = [
  'Analysing column structure…',
  'Identifying field patterns…',
  'Mapping to CRM schema…',
  'Extracting lead records…',
  'Validating extracted data…',
  'Finalising import…',
];

interface Props {
  totalBatches: number;
  currentBatch: number;
}

export default function ProcessingState({ totalBatches, currentBatch }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const progress = totalBatches > 0 ? Math.min((currentBatch / totalBatches) * 100, 95) : 10;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.icon}>
        <svg className={styles.spin} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke="var(--border)" strokeWidth="3"/>
          <path d="M20 4 A16 16 0 0 1 36 20" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>AI is processing your CSV</h3>
        <p className={styles.message} key={msgIdx}>{MESSAGES[msgIdx]}</p>

        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {totalBatches > 0 && (
          <p className={styles.batchInfo}>
            Batch <strong>{Math.min(currentBatch + 1, totalBatches)}</strong> of <strong>{totalBatches}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
