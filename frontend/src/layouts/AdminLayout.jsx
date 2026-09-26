import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/users') || location.pathname.includes('/candidates') || location.pathname.includes('/recruiters')) return 'User Administration & Governance';
    if (location.pathname.includes('/companies')) return 'Company Directory & Verification';
    if (location.pathname.includes('/jobs')) return 'Job Moderation & Compliance';
    if (location.pathname.includes('/applications')) return 'Applications Audit Pipeline';
    if (location.pathname.includes('/broadcast')) return 'System Broadcast Center';
    if (location.pathname.includes('/audit-logs')) return 'Enterprise Audit Trail & Compliance';
    if (location.pathname.includes('/analytics')) return 'System Telemetry & Analytics';
    if (location.pathname.includes('/support')) return 'Support Tickets & Helpdesk';
    if (location.pathname.includes('/api-test')) return 'API Diagnostics';
    return 'Admin Dashboard';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="ADMIN"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-wrapper">
        <Header
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
