'use client';

import styles from './ConfirmBar.module.css';

interface Props {
  rowCount: number;
  onConfirm: () => void;
  onReset: () => void;
}

export default function ConfirmBar({ rowCount, onConfirm, onReset }: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="5" r="0.875" fill="currentColor"/>
        </svg>
        <span>
          <strong>{rowCount.toLocaleString()}</strong> rows ready to import. AI will intelligently map all columns to GrowEasy CRM format.
        </span>
      </div>
      <div className={styles.actions}>
        <button className="btn btn-ghost" onClick={onReset} id="btn-start-over">
          ← Start over
        </button>
        <button className="btn btn-primary btn-lg" onClick={onConfirm} id="btn-confirm-import">
          Confirm Import
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
