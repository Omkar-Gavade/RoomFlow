/**
 * CTASection + Footer — final conversion step of the funnel, then site footer.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck2, Github } from 'lucide-react';

import { Button } from '../../../components/ui/Button.jsx';
import { Reveal } from '../../../components/ui/Reveal.jsx';
import { AuroraBackground } from '../../../components/visuals/AuroraBackground.jsx';
import { ROUTES } from '../../../constants/routes.js';

export function CTASection() {
  return (
    <section className="px-5 py-20 sm:py-24">
      <Reveal className="mx-auto max-w-5xl">
        <div className="noise relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center shadow-xl sm:p-16">
          <AuroraBackground grid={false} />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Give your rooms a system worth using
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Set up your spaces, invite your people, and take the first booking today. No card, no
              installation.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" magnetic className="w-full sm:w-auto">
                  Get started free <ArrowRight size={17} />
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button size="lg" variant="glass" className="w-full sm:w-auto">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const cols = [
    { title: 'Product', links: ['Features', 'How it works', 'Rollout', 'Customers'] },
    { title: 'Spaces', links: ['Classrooms', 'Labs', 'Conference rooms', 'Library pods'] },
    { title: 'Company', links: ['About', 'Contact', 'Privacy', 'Terms'] },
  ];

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-grad-brand text-white">
                <CalendarCheck2 size={18} aria-hidden />
              </span>
              <span className="text-[17px] font-bold tracking-tight text-foreground">RoomFlow</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Smart room booking management for universities, offices, libraries and training
              centres.
            </p>
            <a
              href="https://github.com/Omkar-Gavade/RoomFlow"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github size={16} aria-hidden /> View source
            </a>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <ul className="mt-3 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RoomFlow. Final-year engineering project.
          </p>
          <p className="text-xs text-muted-foreground">Built with the MERN stack.</p>
        </div>
      </div>
    </footer>
  );
}

export default CTASection;
