/**
 * Motion system — parameters sourced from UI/UX Pro Max `motion.csv`.
 *
 * Skill tiers translated from GSAP to Framer Motion:
 *   Scroll Reveal · Subtle   → opacity 0→1, y 12, 350ms, power1.out, viewport top 90%
 *   Scroll Reveal · Standard → children y 24, 500ms, stagger 0.08, power2.out, top 85%
 *   Stagger List             → y 8, 300ms, stagger 0.03 (0.02–0.04 for >10 items)
 *   Press feedback           → scale 0.96 → 1.0 (SaaS High-Tech Boutique)
 *   Spring                   → mass 1, damping 15, stiffness 120 (same source)
 *
 * Skill guardrails honoured: never stagger >0.1s per item; ≤8 staggered children
 * per container; only GPU-friendly properties (transform/opacity) are animated.
 */

/** power1.out ≈ easeOutQuad */
export const EASE_1 = [0.25, 0.46, 0.45, 0.94];
/** power2.out ≈ easeOutCubic */
export const EASE_2 = [0.215, 0.61, 0.355, 1];

export const SPRING = { type: 'spring', mass: 1, damping: 15, stiffness: 120 };
export const SPRING_SOFT = { type: 'spring', mass: 0.8, damping: 20, stiffness: 160 };

/** Scroll-reveal viewport config — matches ScrollTrigger `start: top 85%`. */
export const VIEWPORT = { once: true, margin: '0px 0px -15% 0px' };
export const VIEWPORT_SUBTLE = { once: true, margin: '0px 0px -10% 0px' };

// --- Reveals ---------------------------------------------------------------

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_2 } },
};

export const fadeUpSubtle = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_1 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE_1 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_2 } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE_2 } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE_2 } },
};

// --- Containers ------------------------------------------------------------

/** Standard section container: ≤8 children, 0.08s stagger (skill limit). */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Long lists (>10 rows): 0.03s stagger so total reveal stays snappy. */
export const staggerList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

export const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_1 } },
};

// --- Interaction -----------------------------------------------------------

/** Press feedback: 0.96 → 1.0 (skill). */
export const press = { scale: 0.96 };
export const hoverLift = { y: -4, transition: { duration: 0.2, ease: EASE_2 } };

// --- Page transitions ------------------------------------------------------

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE_1 } },
};

/** Modal/dialog spring entrance. */
export const modalTransition = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: SPRING_SOFT },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.15 } },
};

/** Build a float loop with a per-card phase offset (hero cards). */
export const floatLoop = (delay = 0, distance = 10) => ({
  y: [0, -distance, 0],
  transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay },
});
