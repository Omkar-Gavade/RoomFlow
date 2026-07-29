/**
 * DashboardPage — role-adaptive, one API call per role (FR-DASH-04).
 * Layout follows the skill's Executive Dashboard shape: KPI row (≤5) → charts →
 * work queue → activity. Every region has loading / empty / error handling.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DoorOpen, Users, ClipboardList, CalendarCheck, Clock, CalendarDays, ArrowRight,
} from 'lucide-react';

import { StatCard } from '../components/ui/StatCard.jsx';
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton.jsx';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import { RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import {
  WelcomeBar, QuickActions, QUICK_ACTION_PRESETS, TrendCard, StatusBreakdown,
  UtilizationCard, BookingList, ActivityFeed,
} from '../features/dashboard/components/DashboardSections.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { dashboardApi } from '../features/dashboard/dashboardApi.js';
import { ROLES } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking trend</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="shimmer h-48 rounded-md bg-muted/70" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const fetcher =
      user.role === ROLES.ADMIN
        ? dashboardApi.admin
        : user.role === ROLES.STAFF
          ? dashboardApi.staff
          : dashboardApi.student;
    return fetcher()
      .then(setData)
      .catch((err) => setError(err.message || 'Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, [user.role]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const k = data.kpis || {};
  const isAdmin = user.role === ROLES.ADMIN;
  const isStaff = user.role === ROLES.STAFF;

  const kpis = isAdmin
    ? [
        { label: 'Total rooms', value: k.totalRooms, icon: DoorOpen, tone: 'primary' },
        { label: 'Active today', value: k.activeBookingsToday, icon: CalendarCheck, tone: 'accent' },
        { label: 'Pending approvals', value: k.pendingApprovals, icon: ClipboardList, tone: 'pending' },
        { label: 'Total users', value: k.totalUsers, icon: Users, tone: 'primary' },
      ]
    : isStaff
      ? [
          { label: 'My upcoming', value: k.myUpcoming, icon: CalendarDays, tone: 'primary' },
          { label: 'Awaiting approval', value: k.awaitingApproval, icon: ClipboardList, tone: 'pending' },
          { label: 'Bookings today', value: k.bookingsToday, icon: CalendarCheck, tone: 'accent' },
        ]
      : [
          { label: 'Upcoming', value: k.upcomingBookings, icon: CalendarDays, tone: 'primary' },
          { label: 'Pending requests', value: k.pendingRequests, icon: Clock, tone: 'pending' },
          { label: 'This month', value: k.thisMonth, icon: CalendarCheck, tone: 'accent' },
        ];

  const actions = isAdmin
    ? [QUICK_ACTION_PRESETS.browse, QUICK_ACTION_PRESETS.approvals, QUICK_ACTION_PRESETS.reports]
    : isStaff
      ? [QUICK_ACTION_PRESETS.browse, QUICK_ACTION_PRESETS.approvals, QUICK_ACTION_PRESETS.mine]
      : [QUICK_ACTION_PRESETS.browse, QUICK_ACTION_PRESETS.mine];

  return (
    <div className="space-y-6">
      <WelcomeBar name={user.name} role={user.role} />

      {/* KPI row — max 4 (skill: 4–6 maximum) */}
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <RevealItem key={kpi.label}>
            <StatCard {...kpi} />
          </RevealItem>
        ))}
      </RevealGroup>

      <QuickActions items={actions} />

      {isAdmin && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TrendCard data={data.bookingTrend} />
            </div>
            <UtilizationCard value={k.utilizationToday} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BookingList
                title="Pending approvals"
                subtitle="Oldest requests first"
                rows={data.pendingQueue}
                emptyTitle="Queue is clear"
                emptyMessage="Every request has been actioned. Nice work."
                action={
                  <Link to={ROUTES.APPROVALS}>
                    <Button variant="ghost" size="sm">
                      View all <ArrowRight size={14} />
                    </Button>
                  </Link>
                }
              />
            </div>
            <StatusBreakdown breakdown={data.statusBreakdown} />
          </div>
        </>
      )}

      {isStaff && (
        <div className="grid gap-4 lg:grid-cols-2">
          <BookingList
            title="My upcoming bookings"
            rows={data.myUpcoming}
            emptyTitle="No upcoming bookings"
            emptyMessage="Reserve a room and it will appear here."
            action={
              <Link to={ROUTES.MY_BOOKINGS}>
                <Button variant="ghost" size="sm">
                  All <ArrowRight size={14} />
                </Button>
              </Link>
            }
          />
          <BookingList
            title="Awaiting your approval"
            rows={data.approvalQueue}
            emptyTitle="Nothing to review"
            emptyMessage="New requests will land here for a decision."
            action={
              <Link to={ROUTES.APPROVALS}>
                <Button variant="ghost" size="sm">
                  Queue <ArrowRight size={14} />
                </Button>
              </Link>
            }
          />
        </div>
      )}

      {!isAdmin && !isStaff && (
        <div className="grid gap-4 lg:grid-cols-2">
          <BookingList
            title="My upcoming bookings"
            rows={data.upcoming}
            emptyTitle="No bookings yet"
            emptyMessage="Find a free room and make your first request."
            action={
              <Link to={ROUTES.ROOMS}>
                <Button variant="ghost" size="sm">
                  Browse <ArrowRight size={14} />
                </Button>
              </Link>
            }
          />
          <ActivityFeed items={data.recentNotifications} />
        </div>
      )}
    </div>
  );
}
