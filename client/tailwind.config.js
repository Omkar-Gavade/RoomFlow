/**
 * Tailwind config — DESIGN-SYSTEM.md §16, ADR-D02/D03/D05/D06/D12.
 * darkMode: 'class'; semantic colours resolve to CSS variables (never hardcode).
 * Fonts: Inter (sans) + Fira Code (mono). 8px spacing scale + radius tokens.
 */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: { DEFAULT: 'var(--color-card)', foreground: 'var(--color-card-foreground)' },
        primary: { DEFAULT: 'var(--color-primary)', foreground: 'var(--color-on-primary)' },
        secondary: { DEFAULT: 'var(--color-secondary)', foreground: 'var(--color-on-primary)' },
        accent: { DEFAULT: 'var(--color-accent)', foreground: 'var(--color-on-accent)' },
        muted: { DEFAULT: 'var(--color-muted)', foreground: 'var(--color-muted-foreground)' },
        border: 'var(--color-border)',
        input: 'var(--color-border)',
        ring: 'var(--color-ring)',
        destructive: { DEFAULT: 'var(--color-destructive)', foreground: 'var(--color-on-primary)' },
        // Booking status vocabulary (DESIGN-SYSTEM §2.2)
        status: {
          pending: 'var(--status-pending)',
          approved: 'var(--status-approved)',
          rejected: 'var(--status-rejected)',
          cancelled: 'var(--status-cancelled)',
          completed: 'var(--status-completed)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};
