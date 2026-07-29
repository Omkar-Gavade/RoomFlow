/**
 * LandingPage — composed from the skill's "Trust & Authority + Conversion"
 * section order (hero → proof → solution → CTA) with the "Funnel (3-Step)"
 * workflow block inserted as the solution walk-through.
 */
import { LandingNav } from '../../features/landing/components/LandingNav.jsx';
import { Hero } from '../../features/landing/components/Hero.jsx';
import { TrustBand, StatsBand } from '../../features/landing/components/TrustBand.jsx';
import { FeatureBento } from '../../features/landing/components/FeatureBento.jsx';
import { Workflow } from '../../features/landing/components/Workflow.jsx';
import { Timeline } from '../../features/landing/components/Timeline.jsx';
import { Testimonials } from '../../features/landing/components/Testimonials.jsx';
import { CTASection, Footer } from '../../features/landing/components/CTASection.jsx';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main id="main">
        <Hero />
        <TrustBand />
        <StatsBand />
        <FeatureBento />
        <Workflow />
        <Timeline />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
