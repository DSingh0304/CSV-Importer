'use client';

import { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styles from './ResultTable.module.css';

export interface ImportRecord {
  first_name?: string;
  last_name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  crm_status?: string;
  data_source?: string;
  skip_reason?: string;
}

interface Props {
  records: ImportRecord[];
}

export default function ResultTable({ records }: Props) {
  const [filter, setFilter] = useState<'ALL' | 'VALID' | 'SKIPPED'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredRecords = records.filter(r => {
    if (filter === 'VALID') return !r.skip_reason;
    if (filter === 'SKIPPED') return !!r.skip_reason;
    return true;
  });

  const rowVirtualizer = useVirtualizer({
    count: filteredRecords.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const validCount = records.filter(r => !r.skip_reason).length;
  const skippedCount = records.length - validCount;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.statGroup}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{records.length}</span>
          </div>
          <div className={styles.statGroup}>
            <span className={styles.statLabel}>Imported</span>
            <span className={styles.statValueSuccess}>{validCount}</span>
          </div>
          <div className={styles.statGroup}>
            <span className={styles.statLabel}>Skipped</span>
            <span className={styles.statValueWarning}>{skippedCount}</span>
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
              const isSkipped = !!record.skip_reason;
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
                      <span className={styles.badgeWarning} title={record.skip_reason}>Skipped</span>
                    ) : (
                      <span className={styles.badgeSuccess}>Ready</span>
                    )}
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{record.first_name} {record.last_name}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{record.email || <span className={styles.empty}>—</span>}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{record.country_code} {record.mobile_without_country_code || <span className={styles.empty}>—</span>}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{record.crm_status || <span className={styles.empty}>—</span>}</div>
                  </div>
                  <div className={styles.td} role="cell">
                    <div className={styles.cellContent}>{record.data_source || <span className={styles.empty}>—</span>}</div>
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
