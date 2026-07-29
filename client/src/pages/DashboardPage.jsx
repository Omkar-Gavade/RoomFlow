/**
 * DashboardPage — role-adaptive (DESIGN-SYSTEM §12–14). One API call per role
 * (FR-DASH-04). Skeletons while loading; empty/error states handled.
 */
import { useEffect, useState } from 'react';
import { DoorOpen, Users, ClipboardList, CalendarCheck, Clock, CalendarDays } from 'lucide-react';

import { StatCard } from '../components/ui/StatCard.jsx';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { StatusBadge } from '../components/ui/Badge.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { dashboardApi } from '../features/dashboard/dashboardApi.js';
import { ROLES } from '../constants/roles.js';

function KpiRow({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((k) => (
        <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} />
      ))}
    </div>
  );
}

function BookingList({ title, rows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {!rows || rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing to show yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((b) => (
              <li key={b._id || b.bookingRef} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.roomName || b.userName}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {b.bookingRef} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                {b.status && <StatusBadge status={b.status} />}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetcher =
      user.role === ROLES.ADMIN ? dashboardApi.admin
        : user.role === ROLES.STAFF ? dashboardApi.staff
          : dashboardApi.student;
    fetcher()
      .then((d) => active && setData(d))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user.role]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!data) return null;

  const k = data.kpis || {};
  let kpis = [];
  if (user.role === ROLES.ADMIN) {
    kpis = [
      { label: 'Total Rooms', value: k.totalRooms, icon: DoorOpen },
      { label: 'Total Users', value: k.totalUsers, icon: Users },
      { label: 'Pending Approvals', value: k.pendingApprovals, icon: ClipboardList },
      { label: 'Utilisation Today', value: `${k.utilizationToday ?? 0}%`, icon: CalendarCheck },
    ];
  } else if (user.role === ROLES.STAFF) {
    kpis = [
      { label: 'My Upcoming', value: k.myUpcoming, icon: CalendarDays },
      { label: 'Awaiting Approval', value: k.awaitingApproval, icon: ClipboardList },
      { label: 'Bookings Today', value: k.bookingsToday, icon: CalendarCheck },
    ];
  } else {
    kpis = [
      { label: 'Upcoming', value: k.upcomingBookings, icon: CalendarDays },
      { label: 'Pending Requests', value: k.pendingRequests, icon: Clock },
      { label: 'This Month', value: k.thisMonth, icon: CalendarCheck },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Here is what is happening today.</p>
      </div>
      <KpiRow items={kpis} />
      <div className="grid gap-4 lg:grid-cols-2">
        {user.role === ROLES.ADMIN && <BookingList title="Pending approvals" rows={data.pendingQueue} />}
        {user.role === ROLES.STAFF && (
          <>
            <BookingList title="My upcoming bookings" rows={data.myUpcoming} />
            <BookingList title="Approval queue" rows={data.approvalQueue} />
          </>
        )}
        {user.role === ROLES.STUDENT && <BookingList title="My upcoming bookings" rows={data.upcoming} />}
      </div>
    </div>
  );
}
