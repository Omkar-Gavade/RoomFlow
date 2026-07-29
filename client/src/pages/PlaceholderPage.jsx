/**
 * PlaceholderPage — modules whose UI lands in Phase 7B. Uses the standard empty
 * state so it looks intentional rather than unfinished.
 */
import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';

import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ROUTES } from '../constants/routes.js';

export function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {description || 'This module is being built.'}
        </p>
      </div>
      <Card variant="gradient" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Hammer size={22} aria-hidden />
        </span>
        <h2 className="text-base font-semibold text-foreground">Coming in the next release</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The <span className="font-medium text-foreground">{title}</span> interface is on the way.
          Its API is already live and tested on the server.
        </p>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="outline" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
