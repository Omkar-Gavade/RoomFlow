/** Topbar — DESIGN-SYSTEM §8.8. Menu toggle, theme switch, bell, user menu. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, Bell, LogOut } from 'lucide-react';

import { Button } from '../ui/Button.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_LABELS } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';

export function Topbar({ onMenu }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <button className="md:hidden text-foreground" onClick={onMenu} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.NOTIFICATIONS)} aria-label="Notifications">
          <Bell size={18} />
        </Button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight">{user?.name}</span>
              <span className="block text-xs text-muted-foreground">{ROLE_LABELS[user?.role]}</span>
            </span>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-card p-1 shadow-lg"
              role="menu"
            >
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                role="menuitem"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
