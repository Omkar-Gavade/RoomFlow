/**
 * FeatureBento — solution overview (Trust & Authority pattern, section 3).
 * Bento asymmetry (skill SaaS Boutique "bento") replaces the uniform 3×2 grid:
 * one hero tile, one wide tile, four supporting tiles. Stagger capped at 6
 * children (skill limit ≤8 @ 0.08s).
 */
import {
  CalendarRange, ShieldCheck, BellRing, BarChart3, Users2, Building2,
} from 'lucide-react';

import { Card } from '../../../components/ui/Card.jsx';
import { Reveal, RevealGroup, RevealItem } from '../../../components/ui/Reveal.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { StatusBadge } from '../../../components/ui/Badge.jsx';

function TileHead({ icon: Icon, title, text }) {
  return (
    <>
      <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon size={19} aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </>
  );
}

export function FeatureBento() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Platform</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything a booking desk does — automated
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            One system for availability, approvals, notifications and reporting, across every kind
            of space you operate.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-6">
          {/* Hero tile */}
          <RevealItem className="md:col-span-4">
            <Card variant="gradient" hover className="h-full overflow-hidden p-6">
              <TileHead
                icon={CalendarRange}
                title="Live availability, down to the slot"
                text="Every room's free/busy state is computed from one indexed query — no stale calendars, no phone calls."
              />
              <div className="mt-6 space-y-2.5">
                {[
                  { name: 'Seminar Hall A', pct: 82, status: 'approved' },
                  { name: 'CS Lab 01', pct: 45, status: 'pending' },
                  { name: 'Conference 3F', pct: 63, status: 'approved' },
                ].map((r) => (
                  <div key={r.name} className="flex items-center gap-4">
                    <span className="w-28 shrink-0 truncate text-xs font-medium text-muted-foreground">
                      {r.name}
                    </span>
                    <Progress value={r.pct} className="flex-1" />
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </Card>
          </RevealItem>

          {/* Conflict engine */}
          <RevealItem className="md:col-span-2">
            <Card hover className="h-full p-6">
              <TileHead
                icon={ShieldCheck}
                title="Conflict engine"
                text="Overlaps are rejected inside a database transaction — double-booking is impossible, not unlikely."
              />
              <p className="mt-5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-accent">start</span> &lt; existing.end
                <br />
                <span className="text-accent">end</span> &gt; existing.start
              </p>
            </Card>
          </RevealItem>

          {/* Notifications */}
          <RevealItem className="md:col-span-2">
            <Card hover className="h-full p-6">
              <TileHead
                icon={BellRing}
                title="Notifications"
                text="Confirmation, approval, rejection and 1-hour reminders — in-app and email with calendar invites."
              />
            </Card>
          </RevealItem>

          {/* Reports */}
          <RevealItem className="md:col-span-2">
            <Card hover className="h-full p-6">
              <TileHead
                icon={BarChart3}
                title="Utilisation reports"
                text="Daily, weekly and monthly analytics with peak hours, most-booked rooms and CSV export."
              />
            </Card>
          </RevealItem>

          {/* Roles */}
          <RevealItem className="md:col-span-2">
            <Card hover className="h-full p-6">
              <TileHead
                icon={Users2}
                title="Role-based access"
                text="Admin, staff, student and guest — permissions enforced on every endpoint, not just the UI."
              />
            </Card>
          </RevealItem>

          {/* Any space */}
          <RevealItem className="md:col-span-6">
            <Card variant="glass" className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
                  <Building2 size={19} aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Built for every kind of space</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Classrooms, labs, seminar halls, auditoriums, conference rooms, hostel rooms,
                    library pods and meeting booths.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Classroom', 'Lab', 'Seminar Hall', 'Auditorium', 'Library Pod'].map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Card>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}

export default FeatureBento;
