/**
 * AuroraBackground — soft animated gradient mesh (skill: Glassmorphism requires a
 * "vibrant background verified" behind glass surfaces; SaaS Boutique gradient).
 *
 * Three blurred blobs only — skill Parallax note: beyond 3–4 layers the visual
 * return diminishes while cost multiplies. Pure CSS keyframes on transform =
 * GPU-composited, no JS per frame. Decorative → aria-hidden.
 */
import { cn } from '../../lib/cn.js';

export function AuroraBackground({ className, grid = true }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {grid && <div className="absolute inset-0 grid-pattern [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />}

      <div
        className="absolute -left-[10%] -top-[20%] h-[38rem] w-[38rem] rounded-full blur-3xl animate-aurora-drift will-change-transform"
        style={{ background: 'radial-gradient(circle, var(--aurora-1), transparent 62%)' }}
      />
      <div
        className="absolute -right-[12%] top-[6%] h-[32rem] w-[32rem] rounded-full blur-3xl animate-aurora-drift will-change-transform"
        style={{ background: 'radial-gradient(circle, var(--aurora-3), transparent 62%)', animationDelay: '-6s' }}
      />
      <div
        className="absolute bottom-[-18%] left-[24%] h-[30rem] w-[30rem] rounded-full blur-3xl animate-aurora-drift will-change-transform"
        style={{ background: 'radial-gradient(circle, var(--aurora-2), transparent 62%)', animationDelay: '-12s' }}
      />
    </div>
  );
}

export default AuroraBackground;
