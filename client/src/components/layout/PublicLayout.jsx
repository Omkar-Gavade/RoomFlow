/** PublicLayout — DESIGN-SYSTEM §13.2.1. Simple navbar + outlet for public pages. */
import { Link, Outlet } from 'react-router-dom';

import { Button } from '../ui/Button.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { Moon, Sun } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export function PublicLayout() {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">
        <Link to={ROUTES.LANDING} className="text-lg font-bold text-primary">
          RoomFlow
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default PublicLayout;
