'use client';

import { useState, useCallback } from 'react';
import { AppStep, ImportResult } from '@/types/crm';
import { parseCSVClient, ParseResult } from '@/lib/csvParser';
import { importCSV } from '@/lib/api';

import StepRail from '@/components/StepRail/StepRail';
import Uploader from '@/components/Uploader/Uploader';
import PreviewTable from '@/components/PreviewTable/PreviewTable';
import ConfirmBar from '@/components/ConfirmBar/ConfirmBar';
import ProcessingState from '@/components/ProcessingState/ProcessingState';
import ResultTable from '@/components/ResultTable/ResultTable';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

import styles from './page.module.css';

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalBatches] = useState(0);
  const [currentBatch] = useState(0);

  const handleFileSelected = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    try {
      const data = await parseCSVClient(selectedFile);
      setParsed(data);
      setStep('preview');
    } catch {
      setError('Failed to parse CSV. Please check the file and try again.');
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setStep('processing');
    setError(null);

    try {
      const data = await importCSV(file);
      setResult(data);
      setStep('results');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      setError(message);
      setStep('preview');
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setParsed(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="18" height="18" rx="5" fill="var(--accent)" opacity="0.15"/>
                <path d="M7 11l3 3 5-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.brandName}>GrowEasy</span>
            <span className={styles.brandSep} aria-hidden="true">/</span>
            <span className={styles.brandPage}>CSV Importer</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">

          {step === 'upload' && (
            <div className={styles.hero}>
              <h1 className={styles.heroTitle}>Import leads from any CSV</h1>
              <p className={styles.heroDesc}>
                Upload a CSV from any source — Facebook Ads, Google Ads, real estate CRMs, or manually created spreadsheets.
                AI will intelligently map your columns to GrowEasy CRM format.
              </p>
            </div>
          )}

          {step !== 'upload' && (
            <div className={styles.railWrapper}>
              <StepRail currentStep={step} />
            </div>
          )}

          {step !== 'upload' && step !== 'processing' && (
            <div className={styles.stepLabel}>
              {step === 'preview' && (
                <>
                  <h2 className={styles.stepTitle}>Preview your data</h2>
                  <p className={styles.stepDesc}>Review the uploaded rows before importing. No AI processing has happened yet.</p>
                </>
              )}
              {step === 'results' && (
                <>
                  <h2 className={styles.stepTitle}>Import complete</h2>
                  <p className={styles.stepDesc}>Your leads have been extracted and mapped to GrowEasy CRM format.</p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className={styles.errorBanner} role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.content}>
            {step === 'upload' && (
              <Uploader onFileSelected={handleFileSelected} />
            )}

            {step === 'preview' && parsed && (
              <>
                <PreviewTable
                  headers={parsed.headers}
                  rows={parsed.rows}
                  totalRows={parsed.totalRows}
                />
                <ConfirmBar
                  rowCount={parsed.totalRows}
                  onConfirm={handleConfirm}
                  onReset={handleReset}
                />
              </>
            )}

            {step === 'processing' && (
              <ProcessingState totalBatches={totalBatches} currentBatch={currentBatch} />
            )}

            {step === 'results' && result && (
              <ResultTable
                records={result.records}
                skippedRecords={result.skippedRecords}
                imported={result.imported}
                skipped={result.skipped}
                onReset={handleReset}
              />
            )}
          </div>

        </div>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span>Built for GrowEasy · 2026</span>
          <a href="https://groweasy.ai" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
            groweasy.ai 
          </a>
        </div>
      </footer>
    </div>
  );
}
