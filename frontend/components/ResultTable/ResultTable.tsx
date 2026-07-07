'use client';

import { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CRMRecord, SkippedRecord } from '@/types/crm';
import styles from './ResultTable.module.css';

interface Props {
  records: CRMRecord[];
  skippedRecords: SkippedRecord[];
  imported: number;
  skipped: number;
  onReset: () => void;
}

type UnifiedRecord = 
  | { type: 'valid'; data: CRMRecord }
  | { type: 'skipped'; data: SkippedRecord };

export default function ResultTable({ records, skippedRecords, imported, skipped, onReset }: Props) {
  const [filter, setFilter] = useState<'ALL' | 'VALID' | 'SKIPPED'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const unifiedRecords: UnifiedRecord[] = useMemo(() => {
    const valid: UnifiedRecord[] = records.map(r => ({ type: 'valid', data: r }));
    const skip: UnifiedRecord[] = skippedRecords.map(r => ({ type: 'skipped', data: r }));
    return [...valid, ...skip];
  }, [records, skippedRecords]);

  const filteredRecords = useMemo(() => {
    if (filter === 'VALID') return unifiedRecords.filter(r => r.type === 'valid');
    if (filter === 'SKIPPED') return unifiedRecords.filter(r => r.type === 'skipped');
    return unifiedRecords;
  }, [unifiedRecords, filter]);

  const rowVirtualizer = useVirtualizer({
    count: filteredRecords.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.statGroup}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{imported + skipped}</span>
          </div>
          <div className={styles.statGroup}>
            <span className={styles.statLabel}>Imported</span>
            <span className={styles.statValueSuccess}>{imported}</span>
          </div>
          <div className={styles.statGroup}>
            <span className={styles.statLabel}>Skipped</span>
            <span className={styles.statValueWarning}>{skipped}</span>
          </div>
        </div>
        
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'ALL' ? styles.active : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'VALID' ? styles.active : ''}`}
            onClick={() => setFilter('VALID')}
          >
            Imported
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'SKIPPED' ? styles.active : ''}`}
            onClick={() => setFilter('SKIPPED')}
          >
            Skipped
          </button>
          <button className={styles.resetBtn} onClick={onReset}>
            Import Another
          </button>
        </div>
      </div>

      <div className={styles.scrollContainer} ref={scrollRef}>
        <div className={styles.table} role="table">
          <div className={styles.stickyHead} role="rowgroup">
            <div className={styles.tr} role="row">
              <div className={styles.th} role="columnheader">Status</div>
              <div className={styles.th} role="columnheader">Name</div>
              <div className={styles.th} role="columnheader">Email</div>
              <div className={styles.th} role="columnheader">Mobile</div>
              <div className={styles.th} role="columnheader">CRM Status</div>
              <div className={styles.th} role="columnheader">Source</div>
            </div>
          </div>
          <div
            role="rowgroup"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const record = filteredRecords[virtualRow.index];
              const isSkipped = record.type === 'skipped';
              
              let name = '—';
              let email = '—';
              let mobile = '—';
              let crmStatus = '—';
              let source = '—';
              let skipReason = '';

              if (isSkipped) {
                const s = record.data as SkippedRecord;
                skipReason = s.reason;
                // Try to extract some info from rawData if available
                if (s.rawData) {
                  const r = s.rawData;
                  name = r.name || r.full_name || '—';
                  email = r.email || r.email_address || '—';
                  mobile = r.phone || r.mobile || r.phone_number || '—';
                }
              } else {
                const v = record.data as CRMRecord;
                name = v.name || '—';
                email = v.email || '—';
                mobile = `${v.country_code || ''} ${v.mobile_without_country_code || ''}`.trim() || '—';
                crmStatus = v.crm_status || '—';
                source = v.data_source || '—';
              }

              return (
                <div
                  key={virtualRow.index}
                  className={`${styles.tr} ${isSkipped ? styles.trSkipped : ''}`}
                  role="row"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className={styles.td} role="cell">
                    {isSkipped ? (
                      <span className={styles.badgeWarning} title={skipReason}>Skipped: {skipReason}</span>
                    ) : (
                      <span className={styles.badgeSuccess}>Ready</span>
                    )}
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{name}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{email}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{mobile}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{crmStatus}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{source}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
