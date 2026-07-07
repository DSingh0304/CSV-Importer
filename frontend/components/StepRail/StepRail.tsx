import styles from './StepRail.module.css';
import { AppStep } from '@/types/crm';

interface Step {
  id: AppStep;
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { id: 'upload',     label: 'Upload',  number: 1 },
  { id: 'preview',    label: 'Preview', number: 2 },
  { id: 'processing', label: 'Import',  number: 3 },
  { id: 'results',    label: 'Results', number: 4 },
];

const ORDER: AppStep[] = ['upload', 'preview', 'processing', 'results'];

interface Props {
  currentStep: AppStep;
}

export default function StepRail({ currentStep }: Props) {
  const currentIndex = ORDER.indexOf(currentStep);

  return (
    <nav className={styles.rail} aria-label="Import progress">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isActive   = i === currentIndex;
        const state = isComplete ? 'complete' : isActive ? 'active' : 'idle';

        return (
          <div key={step.id} className={`${styles.step} ${styles[state]}`}>
            <div className={styles.indicator} aria-hidden="true">
              {isComplete ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <span className={styles.label}>{step.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`${styles.connector} ${isComplete ? styles.connectorDone : ''}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
