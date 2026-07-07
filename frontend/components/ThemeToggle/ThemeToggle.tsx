'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className={styles.toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      id="btn-theme-toggle"
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M13.07 2.93l-1.06 1.06M3.99 12.01l-1.06 1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 10.5A6.5 6.5 0 0 1 5.5 2a6.5 6.5 0 1 0 8.5 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}
