/**
 * SocialButtons — placeholders. Deliberately disabled with an explanatory title
 * rather than a dead link, so the affordance never lies about what it does.
 */
import { Button } from '../../../components/ui/Button.jsx';

const PROVIDERS = [
  { name: 'Google', letter: 'G' },
  { name: 'Microsoft', letter: 'M' },
];

export function SocialButtons({ label = 'or continue with' }) {
  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map((p) => (
          <Button
            key={p.name}
            type="button"
            variant="outline"
            disabled
            title="Single sign-on is planned for a future release"
            className="w-full"
          >
            <span className="grid h-5 w-5 place-items-center rounded bg-muted text-[11px] font-bold text-muted-foreground">
              {p.letter}
            </span>
            {p.name}
          </Button>
        ))}
      </div>
    </>
  );
}

export default SocialButtons;
