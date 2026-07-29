/**
 * Sidebar — DESIGN-SYSTEM §8.9. Role-scoped nav with a shared `layoutId` pill
 * that slides between active items (single spring, no per-item animation).
 * Collapsible rail on lg+, off-canvas drawer below md with a scrim.
 */
import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, DoorOpen, CalendarDays, CalendarRange, ClipboardCheck,
  Users, BarChart3, Bell, User as UserIcon, Settings, CalendarCheck2, X,
} from 'lucide-react';

import { cn } from '../../lib/cn.js';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { SPRING_SOFT } from '../../lib/motion.js';

const NAV = [
  { section: 'Overview', items: [
    { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'student'] },
    { to: ROUTES.CALENDAR, label: 'Calendar', icon: CalendarRange, roles: ['admin', 'staff', 'student'] },
  ]},
  { section: 'Booking', items: [
    { to: ROUTES.ROOMS, label: 'Rooms', icon: DoorOpen, roles: ['admin', 'staff', 'student'] },
    { to: ROUTES.MY_BOOKINGS, label: 'My Bookings', icon: CalendarDays, roles: ['admin', 'staff', 'student'] },
    { to: ROUTES.APPROVALS, label: 'Approvals', icon: ClipboardCheck, roles: ['admin', 'staff'] },
  ]},
  { section: 'Manage', items: [
    { to: ROUTES.USERS, label: 'Users', icon: Users, roles: ['admin'] },
    { to: ROUTES.REPORTS, label: 'Reports', icon: BarChart3, roles: ['admin', 'staff'] },
    { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings, roles: ['admin'] },
  ]},
  { section: 'Account', items: [
    { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: Bell, roles: ['admin', 'staff', 'student'] },
    { to: ROUTES.PROFILE, label: 'Profile', icon: UserIcon, roles: ['admin', 'staff', 'student'] },
  ]},
];

const NavItem = memo(function NavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink to={to} onClick={onNavigate} className="block">
      {({ isActive }) => (
        <span
          className={cn(
            'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
            isActive ? 'text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              transition={SPRING_SOFT}
              className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/15"
              aria-hidden
            />
          )}
          <Icon size={17} className="relative z-10 shrink-0" aria-hidden />
          <span className="relative z-10">{label}</span>
        </span>
      )}
    </NavLink>
  );
});

export function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const content = (
    <>
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-grad-brand text-white shadow-md">
            <CalendarCheck2 size={18} aria-hidden />
          </span>
          <span className="text-[16px] font-bold tracking-tight text-foreground">RoomFlow</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground md:hidden" aria-label="Close menu">
          <X size={19} />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {NAV.map((group) => {
          const items = group.items.filter((i) => i.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={group.section}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {items.map((i) => (
                  <NavItem key={i.to} {...i} onNavigate={onClose} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-lg bg-grad-brand p-4 text-white">
          <p className="text-xs font-semibold">Need a room now?</p>
          <p className="mt-1 text-[11px] opacity-90">Find free spaces in seconds.</p>
          <NavLink
            to={ROUTES.ROOMS}
            onClick={onClose}
            className="mt-3 inline-block rounded-md bg-white/20 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-xs transition-colors hover:bg-white/30"
          >
            Browse rooms
          </NavLink>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
              aria-hidden
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={SPRING_SOFT}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card md:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur-xs md:flex">
        {content}
      </aside>
    </>
  );
}

export default Sidebar;
