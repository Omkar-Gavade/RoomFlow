/**
 * Button — DESIGN-SYSTEM §8.1 + skill "SaaS High-Tech Boutique"
 * (gradient buttons, press 0.96→1.0, spring feedback).
 *
 * Extras: magnetic cursor pull, ripple on press, gradient shine sweep on hover.
 * All motion is transform/opacity only (GPU) and disabled under reduced-motion.
 * Min 44×44 hit area on touch sizes (skill: Touch CRITICAL).
 */
import { forwardRef, useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn.js';
import { SPRING, press as pressVariant } from '../../lib/motion.js';

const VARIANTS = {
  primary:
    'bg-grad-brand text-white shadow-md hover:shadow-glow border border-white/10',
  solid: 'bg-primary text-primary-foreground shadow-sm hover:brightness-110',
  accent: 'bg-accent text-accent-foreground shadow-sm hover:brightness-110',
  destructive: 'bg-destructive text-white shadow-sm hover:brightness-110',
  secondary: 'bg-muted text-foreground hover:bg-muted/70',
  outline: 'border border-border bg-card/60 text-foreground hover:bg-muted backdrop-blur-xs',
  ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  glass: 'glass text-foreground hover:shadow-md',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm rounded-md gap-1.5',
  md: 'h-11 px-5 text-sm rounded-md gap-2',
  lg: 'h-12 px-7 text-base rounded-lg gap-2',
  xl: 'h-14 px-9 text-base rounded-lg gap-2.5',
  icon: 'h-11 w-11 rounded-md',
};

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    magnetic = false,
    disabled,
    className,
    children,
    onClick,
    ...props
  },
  ref
) {
  const reduce = useReducedMotion();
  const localRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  const handleMove = useCallback(
    (e) => {
      if (!magnetic || reduce) return;
      const el = localRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Pull max ~6px toward the cursor — subtle, never gimmicky.
      setOffset({
        x: ((e.clientX - (r.left + r.width / 2)) / r.width) * 12,
        y: ((e.clientY - (r.top + r.height / 2)) / r.height) * 8,
      });
    },
    [magnetic, reduce]
  );

  const handleClick = useCallback(
    (e) => {
      if (!reduce) {
        const el = localRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          const id = Date.now();
          setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
          setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 600);
        }
      }
      onClick?.(e);
    },
    [onClick, reduce]
  );

  return (
    <motion.button
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      onMouseMove={handleMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      onClick={handleClick}
      disabled={disabled || loading}
      animate={{ x: offset.x, y: offset.y }}
      transition={SPRING}
      whileTap={reduce || disabled ? undefined : pressVariant}
      className={cn(
        'group relative isolate inline-flex select-none items-center justify-center overflow-hidden font-medium',
        'cursor-pointer transition-[background,box-shadow,color] duration-200 ease-out-power2',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {/* Shine sweep on hover (premium gradient buttons) */}
      {!reduce && (variant === 'primary' || variant === 'accent') && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}

      {/* Ripple */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          initial={{ opacity: 0.35, scale: 0 }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ left: r.x, top: r.y }}
          className="pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
        />
      ))}

      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
});

export default Button;
