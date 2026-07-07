'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styles from './PreviewTable.module.css';

interface Props {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export default function PreviewTable({ headers, rows, totalRows }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 36, // estimated row height
    overscan: 10,
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <span className={styles.rowCount}>
          <strong>{totalRows.toLocaleString()}</strong> row{totalRows !== 1 ? 's' : ''} found
        </span>
        <span className={styles.colCount}>{headers.length} columns</span>
      </div>

      <div className={styles.scrollContainer} ref={scrollRef}>
        <div className={styles.table} role="table" aria-label="CSV Preview">
          <div className={styles.stickyHead} role="rowgroup">
            <div className={styles.tr} role="row">
              <div className={`${styles.th} ${styles.indexCell}`} role="columnheader">#</div>
              {headers.map((h) => (
                <div key={h} className={styles.th} role="columnheader">{h}</div>
              ))}
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
              const row = rows[virtualRow.index];
              return (
                <div
                  key={virtualRow.index}
                  className={styles.tr}
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
                  <div className={`${styles.td} ${styles.indexCell} ${styles.indexNum}`} role="cell">
                    {virtualRow.index + 1}
                  </div>
                  {headers.map((h) => (
                    <div key={h} className={styles.td} role="cell">
                      <span className={styles.cellContent} title={row[h] || ''}>
                        {row[h] || <span className={styles.empty}>—</span>}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
