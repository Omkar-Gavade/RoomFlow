/**
 * Tailwind config — DESIGN-SYSTEM.md §16, ADR-D12.
 *
 * Every colour is `rgb(var(--channel) / <alpha-value>)` so opacity modifiers
 * (bg-primary/10, border-accent/25 …) resolve correctly. Defining colours as raw
 * hex inside CSS variables silently breaks the alpha modifier — that bug flattened
 * the entire tint layer, so this form is mandatory.
 */
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: c('--c-background'),
        foreground: c('--c-foreground'),
        surface: c('--c-surface-2'),
        card: { DEFAULT: c('--c-surface'), foreground: c('--c-foreground') },
        primary: { DEFAULT: c('--c-primary'), soft: c('--c-primary-soft'), foreground: c('--c-on-primary') },
        violet: c('--c-violet'),
        accent: { DEFAULT: c('--c-accent'), foreground: c('--c-on-accent') },
        muted: { DEFAULT: c('--c-muted'), foreground: c('--c-muted-foreground') },
        border: c('--c-border'),
        input: c('--c-border'),
        ring: c('--c-ring'),
        destructive: { DEFAULT: c('--c-destructive'), foreground: c('--c-on-primary') },
        status: {
          pending: c('--c-pending'),
          approved: c('--c-approved'),
          rejected: c('--c-rejected'),
          cancelled: c('--c-cancelled'),
          completed: c('--c-completed'),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-sm': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-md': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.032em' }],
        'display-lg': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.038em' }],
      },
      borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '20px', '2xl': '28px' },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
      },
      backdropBlur: { xs: '4px', glass: '16px' },
      spacing: { 18: '4.5rem', 22: '5.5rem' },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%, -6%, 0) scale(1.09)' },
          '66%': { transform: 'translate3d(-5%, 4%, 0) scale(0.94)' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(0.82)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'aurora-drift': 'aurora-drift 20s ease-in-out infinite',
        marquee: 'marquee 34s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 6s ease infinite',
      },
      transitionTimingFunction: { 'out-power2': 'cubic-bezier(0.215, 0.61, 0.355, 1)' },
    },
  },
  plugins: [],
};
