import { useEffect, useState } from "react";
import './Themer.css';

const STORAGE_KEY = 'theme';

function getInitialTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export default function Themer() {
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    try { return getInitialTheme(); } catch { return 'light'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } 
    catch { /* error handling here */ } 
  }, [theme]);

  function toggle() {
    setTheme((t) => t === 'dark' ? 'light' : 'dark');
  }

  return (
    <button
      className="themer"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light' : 'Dark'}
    >
      <span className="themer__sr-only">{theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}</span>
      {theme === 'dark' ? (
        <svg className="themer__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
        </svg>
      ) : (
        <svg className="themer__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="12" y1="1.75" x2="12" y2="4.25" />
            <line x1="12" y1="19.75" x2="12" y2="22.25" />
            <line x1="1.75" y1="12" x2="4.25" y2="12" />
            <line x1="19.75" y1="12" x2="22.25" y2="12" />
            <line x1="4.5" y1="4.5" x2="6.25" y2="6.25" />
            <line x1="17.75" y1="17.75" x2="19.5" y2="19.5" />
            <line x1="4.5" y1="19.5" x2="6.25" y2="17.75" />
            <line x1="17.75" y1="6.25" x2="19.5" y2="4.5" />
          </g>
        </svg>
      )}
    </button>
  );
}
