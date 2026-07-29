/** Landing — DESIGN-SYSTEM §13.2.1. Hero + features + CTA. */
import { Link } from 'react-router-dom';
import { CalendarCheck, ShieldCheck, Clock, BarChart3, Bell, DoorOpen } from 'lucide-react';

import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ROUTES } from '../../constants/routes.js';

const FEATURES = [
  { icon: CalendarCheck, title: 'Real-time availability', text: 'See what is free the moment you look.' },
  { icon: ShieldCheck, title: 'Conflict-free booking', text: 'Transactional engine prevents double booking.' },
  { icon: Clock, title: 'Approval workflow', text: 'Requests routed to the right approver.' },
  { icon: DoorOpen, title: 'Every space', text: 'Classrooms, labs, halls, hostels, libraries.' },
  { icon: BarChart3, title: 'Analytics', text: 'Utilisation and most-booked reports.' },
  { icon: Bell, title: 'Email alerts', text: 'Confirmations, approvals, and reminders.' },
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
          Digitise room booking. Eliminate conflicts.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          RoomFlow gives colleges, offices, and institutions real-time room availability with a
          conflict-free booking engine.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to={ROUTES.REGISTER}>
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button size="lg" variant="outline">
              Browse Rooms
            </Button>
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-6">
              <Icon className="text-primary" size={24} />
              <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
