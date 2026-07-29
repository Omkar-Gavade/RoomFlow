import { Component } from 'react';
import { AlertOctagon } from 'lucide-react';

import { Button } from '../ui/Button.jsx';

/** Top-level error boundary — always offers a recovery path (skill: Error Recovery). */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('UI error boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertOctagon size={26} aria-hidden />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Something broke on this page</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The error has been logged. Reloading usually clears it.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button variant="outline" onClick={() => window.location.assign('/')}>
              Go home
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
