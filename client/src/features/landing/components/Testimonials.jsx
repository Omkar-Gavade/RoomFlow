/**
 * Testimonials + FAQ — social proof then objection handling, closing the
 * "Trust & Authority" pattern before the final CTA.
 */
import { Quote } from 'lucide-react';

import { Card } from '../../../components/ui/Card.jsx';
import { Reveal, RevealGroup, RevealItem } from '../../../components/ui/Reveal.jsx';
import { Accordion } from '../../../components/ui/Accordion.jsx';

const QUOTES = [
  {
    quote:
      'Timetable clashes used to eat an hour of my week. Now the system simply refuses to create one.',
    name: 'Dr. A. Kulkarni',
    role: 'HOD, Computer Engineering',
    initials: 'AK',
  },
  {
    quote:
      'Students book their own study pods and the library desk stopped being a queue. Adoption was instant.',
    name: 'Priya Menon',
    role: 'Chief Librarian',
    initials: 'PM',
  },
  {
    quote:
      'The utilisation report told us two conference rooms were sitting empty. We repurposed one that quarter.',
    name: 'Rahul Shah',
    role: 'Facilities Manager',
    initials: 'RS',
  },
];

const FAQ = [
  {
    q: 'How does RoomFlow guarantee there are no double bookings?',
    a: 'Every booking is written inside a database transaction that re-checks for overlapping slots before it commits. If two requests arrive at the same instant, exactly one succeeds and the other receives suggested alternative times.',
  },
  {
    q: 'Can staff bookings skip approval?',
    a: 'Yes. Auto-approval is a per-room and per-role setting, so trusted staff can be confirmed instantly while student requests still route to an approver.',
  },
  {
    q: 'Does it work on phones?',
    a: 'RoomFlow is mobile-first and tested at 375, 768, 1024 and 1440 px. Tables collapse into cards and every control meets the 44 px touch-target minimum.',
  },
  {
    q: 'What happens to a booking nobody approves?',
    a: 'A scheduled job expires pending requests once their start time passes, which frees the slot automatically and notifies the requester.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 border-t border-border bg-card/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Customers</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The booking desk, quietly retired
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-3">
          {QUOTES.map((t) => (
            <RevealItem key={t.name}>
              <Card hover className="flex h-full flex-col p-6">
                <Quote size={20} className="text-primary/40" aria-hidden />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-card-foreground">“{t.quote}”</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-grad-brand text-xs font-bold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mx-auto mt-16 max-w-3xl">
          <h3 className="mb-5 text-center text-lg font-semibold text-foreground">Common questions</h3>
          <Accordion items={FAQ} />
        </Reveal>
      </div>
    </section>
  );
}

export default Testimonials;
