/**
 * TrustBand + StatsBand — skill landing pattern "Trust & Authority", section 2:
 * proof (logos, stats) directly after the hero. Counters animate on scroll-in
 * (skill Executive Dashboard: KPI count-up).
 */
import { Marquee } from '../../../components/ui/Marquee.jsx';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter.jsx';
import { Reveal, RevealGroup, RevealItem } from '../../../components/ui/Reveal.jsx';

const ORGS = [
  'Institute of Technology',
  'Northgate University',
  'Meridian Corporate',
  'City Public Library',
  'Skyline Training Co.',
  'Riverside Polytechnic',
];

const STATS = [
  { value: 12500, suffix: '+', label: 'Bookings processed' },
  { value: 480, suffix: '', label: 'Rooms managed' },
  { value: 99.9, suffix: '%', label: 'Conflict-free rate', decimals: 1 },
  { value: 62, suffix: '%', label: 'Less admin time' },
];

export function TrustBand() {
  return (
    <section className="border-y border-border bg-card/40 py-10">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal subtle>
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Trusted by campuses and workplaces
          </p>
        </Reveal>
        <Marquee items={ORGS} />
      </div>
    </section>
  );
}

export function StatsBand() {
  return (
    <section className="py-16 sm:py-20">
      <RevealGroup className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 sm:gap-8 lg:grid-cols-4">
        {STATS.map((s) => (
          <RevealItem key={s.label} className="text-center">
            <p className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export default TrustBand;
