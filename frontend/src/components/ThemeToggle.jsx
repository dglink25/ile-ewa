import { useTheme } from '../context/ThemeContext';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

const OPTIONS = [
  { value: 'light', label: 'Clair', Icon: SunIcon },
  { value: 'dark', label: 'Sombre', Icon: MoonIcon },
  { value: 'system', label: 'Système', Icon: MonitorIcon },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 3,
        background: 'var(--bg-elevated)',
      }}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 28,
              border: 'none',
              borderRadius: 7,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-contrast)' : 'var(--text-muted)',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}