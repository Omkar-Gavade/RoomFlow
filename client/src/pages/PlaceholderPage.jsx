/** Placeholder for feature pages arriving in Phase 7B+. */
import { Card } from '../components/ui/Card.jsx';

export function PlaceholderPage({ title }) {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-foreground">{title}</h1>
      <Card className="p-10 text-center">
        <p className="text-muted-foreground">
          The <span className="font-medium text-foreground">{title}</span> module UI is coming in the
          next frontend phase. The backend API is already live.
        </p>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
