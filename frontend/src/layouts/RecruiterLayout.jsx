import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export const RecruiterLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/jobs/new')) return 'Post New Job';
    if (location.pathname.includes('/applicants')) return 'Candidate Pipeline';
    if (location.pathname.includes('/jobs')) return 'Manage Job Listings';
    if (location.pathname.includes('/interviews')) return 'Interview Schedules';
    if (location.pathname.includes('/company')) return 'Company Organization Profile';
    return 'Recruiter Dashboard';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="RECRUITER"
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

export default RecruiterLayout;
