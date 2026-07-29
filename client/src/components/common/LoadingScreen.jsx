import { Spinner } from '../ui/Spinner.jsx';

/** Full-screen loader — prevents flash-of-login while auth restores (§11.4). */
export function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Spinner size={32} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default LoadingScreen;
