/** DashboardLayout — DESIGN-SYSTEM §10. Sidebar + Topbar + Outlet. */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
