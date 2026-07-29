/**
 * Sidebar — DESIGN-SYSTEM §8.9. Role-scoped nav; active item = primary + accent
 * bar. Off-canvas drawer on mobile. Icon + label (accessible names).
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, DoorOpen, CalendarDays, ClipboardCheck, Users, BarChart3,
  Bell, User as UserIcon, Settings, CalendarRange,
} from 'lucide-react';

import { cn } from '../../lib/cn.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { useAuth } from '../../hooks/useAuth.js';

const NAV = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'student'] },
  { to: ROUTES.ROOMS, label: 'Rooms', icon: DoorOpen, roles: ['admin', 'staff', 'student'] },
  { to: ROUTES.MY_BOOKINGS, label: 'My Bookings', icon: CalendarDays, roles: ['admin', 'staff', 'student'] },
  { to: ROUTES.CALENDAR, label: 'Calendar', icon: CalendarRange, roles: ['admin', 'staff', 'student'] },
  { to: ROUTES.APPROVALS, label: 'Approvals', icon: ClipboardCheck, roles: ['admin', 'staff'] },
  { to: ROUTES.USERS, label: 'Users', icon: Users, roles: ['admin'] },
  { to: ROUTES.REPORTS, label: 'Reports', icon: BarChart3, roles: ['admin', 'staff'] },
  { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: Bell, roles: ['admin', 'staff', 'student'] },
  { to: ROUTES.PROFILE, label: 'Profile', icon: UserIcon, roles: ['admin', 'staff', 'student'] },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const role = user?.role || ROLES.STUDENT;
  const items = NAV.filter((n) => n.roles.includes(role));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={cn(
          'fixed z-40 h-full w-64 shrink-0 border-r border-border bg-card transition-transform md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="text-lg font-bold text-primary">RoomFlow</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
