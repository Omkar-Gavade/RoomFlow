/**
 * Dashboard building blocks — skill "Executive Dashboard": KPI row (4–6 max),
 * trend chart, status breakdown, work queue, all one-page and print-friendly.
 * Each block owns its empty state (skill Feedback: never a blank region).
 */
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarPlus, DoorOpen, ClipboardCheck, BarChart3, Clock } from 'lucide-react';

import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card.jsx';
import { StatusBadge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/States.jsx';
import { AreaChart } from '../../../components/ui/AreaChart.jsx';
import { ProgressRing, Progress } from '../../../components/ui/Progress.jsx';
import { cn } from '../../../lib/cn.js';
import { listItem, staggerList } from '../../../lib/motion.js';
import { ROUTES } from '../../../constants/routes.js';
import { STATUS_META } from '../../../constants/bookingStatus.js';

/** Greeting + date + primary action. */
export function WelcomeBar({ name, role }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const date = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greet}, {name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {date} · <span className="capitalize">{role}</span> workspace
        </p>
      </div>
      <Link to={ROUTES.ROOMS}>
        <Button magnetic>
          <CalendarPlus size={16} /> New booking
        </Button>
      </Link>
    </div>
  );
}

/** Quick actions — 3 tiles, role-filtered by the caller. */
export const QuickActions = memo(function QuickActions({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ to, label, text, icon: Icon, tone }) => (
        <Link key={label} to={to}>
          <Card hover className="group h-full p-4">
            <div className="flex items-start gap-3">
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', tone)}>
                <Icon size={18} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  {label}
                  <ArrowRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
});

export const QUICK_ACTION_PRESETS = {
  browse: { to: ROUTES.ROOMS, label: 'Find a room', text: 'Filter by capacity & facilities', icon: DoorOpen, tone: 'bg-primary/10 text-primary' },
  approvals: { to: ROUTES.APPROVALS, label: 'Review requests', text: 'Approve or reject bookings', icon: ClipboardCheck, tone: 'bg-status-pending/12 text-status-pending' },
  reports: { to: ROUTES.REPORTS, label: 'View reports', text: 'Utilisation & peak hours', icon: BarChart3, tone: 'bg-accent/12 text-accent' },
  mine: { to: ROUTES.MY_BOOKINGS, label: 'My bookings', text: 'Upcoming and past', icon: Clock, tone: 'bg-accent/12 text-accent' },
};

/** Booking trend chart card. */
export function TrendCard({ data }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Booking trend</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Last 7 days</p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
          {data?.reduce((a, b) => a + b.count, 0) || 0} total
        </span>
      </CardHeader>
      <CardBody>
        <AreaChart data={data || []} height={190} />
      </CardBody>
    </Card>
  );
}

/** Status breakdown as labelled bars (colour never alone). */
export function StatusBreakdown({ breakdown }) {
  const entries = Object.entries(breakdown || {}).filter(([, v]) => v > 0);
  const total = entries.reduce((a, [, v]) => a + v, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status breakdown</CardTitle>
      </CardHeader>
      <CardBody>
        {!entries.length ? (
          <EmptyState title="No bookings yet" message="Once bookings exist their statuses appear here." />
        ) : (
          <div className="space-y-3">
            {entries.map(([k, v]) => (
              <div key={k}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={cn('h-2 w-2 rounded-full', STATUS_META[k]?.dot)} aria-hidden />
                    {STATUS_META[k]?.label || k}
                  </span>
                  <span className="font-mono font-medium text-foreground">{v}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: total ? v / total : 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    style={{ originX: 0 }}
                    className={cn('h-full w-full rounded-full', STATUS_META[k]?.dot)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/** Utilisation ring card. */
export function UtilizationCard({ value }) {
  return (
    <Card className="flex flex-col items-center justify-center p-6">
      <CardTitle className="self-start">Room utilisation</CardTitle>
      <p className="mb-4 self-start text-xs text-muted-foreground">Approved hours today</p>
      <ProgressRing value={value || 0} size={124} stroke={10} label="today" />
      <Progress value={value || 0} className="mt-5 w-full" label="Capacity used" />
    </Card>
  );
}

/** Booking list — staggered rows (0.03s per item, skill list tier). */
export function BookingList({ title, subtitle, rows, emptyTitle, emptyMessage, action }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      <CardBody>
        {!rows?.length ? (
          <EmptyState title={emptyTitle} message={emptyMessage} />
        ) : (
          <motion.ul variants={staggerList} initial="hidden" animate="show" className="divide-y divide-border">
            {rows.map((b) => (
              <motion.li
                key={b._id || b.bookingRef}
                variants={listItem}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {b.roomName || 'Room'}
                    {b.userName && <span className="text-muted-foreground"> · {b.userName}</span>}
                  </p>
                  {/* truncate here too — an untruncated mono ref forced the row
                      wider than the card and caused horizontal scroll on mobile */}
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {b.bookingRef} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                {b.status && (
                  <span className="shrink-0">
                    <StatusBadge status={b.status} pulse={b.status === 'pending'} />
                  </span>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </CardBody>
    </Card>
  );
}

/** Notification / activity feed. */
export function ActivityFeed({ items }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardBody>
        {!items?.length ? (
          <EmptyState title="Nothing recent" message="Notifications about your bookings will show up here." />
        ) : (
          <motion.ul variants={staggerList} initial="hidden" animate="show" className="space-y-3">
            {items.map((n) => (
              <motion.li key={n._id} variants={listItem} className="flex gap-3">
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    n.isRead ? 'bg-muted-foreground/40' : 'bg-primary'
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </CardBody>
    </Card>
  );
}
