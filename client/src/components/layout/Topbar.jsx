/**
 * Topbar — DESIGN-SYSTEM §8.8. Sticky glass bar: menu toggle, search affordance,
 * theme switch (rotating icon swap), notification bell with unread dot, user menu.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, LogOut, Menu, Moon, Search, Settings, Sun, User as UserIcon } from 'lucide-react';

import { Button } from '../ui/Button.jsx';
import { Dropdown, DropdownItem } from '../ui/Dropdown.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_LABELS } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';

export function Topbar({ onMenu }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/70 px-4 backdrop-blur-glass md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu size={19} />
      </Button>

      <button
        onClick={() => navigate(ROUTES.ROOMS)}
        className="hidden h-10 flex-1 items-center gap-2.5 rounded-md border border-border bg-background/60 px-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex sm:max-w-sm"
      >
        <Search size={15} aria-hidden />
        Search rooms…
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          /
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle colour theme">
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 animate-pulse-dot rounded-full bg-destructive ring-2 ring-card" />
        </Button>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-muted">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-grad-brand text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-foreground">
                  {user?.name}
                </span>
                <span className="block text-[11px] leading-tight text-muted-foreground">
                  {ROLE_LABELS[user?.role]}
                </span>
              </span>
            </button>
          }
        >
          <div className="border-b border-border px-3 pb-2 pt-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="pt-1">
            <DropdownItem icon={UserIcon} onClick={() => navigate(ROUTES.PROFILE)}>
              Profile
            </DropdownItem>
            <DropdownItem icon={Settings} onClick={() => navigate(ROUTES.SETTINGS)}>
              Settings
            </DropdownItem>
            <DropdownItem icon={LogOut} onClick={handleLogout} className="text-destructive hover:bg-destructive/8">
              Log out
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}

export default Topbar;
