import { Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <p className="font-mono text-5xl font-bold text-primary">404</p>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
