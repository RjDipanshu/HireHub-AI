import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export const RecruiterLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/jobs/new')) return 'Post New Job';
    if (location.pathname.includes('/jobs/') && location.pathname.includes('/applicants')) return 'Applicant Review';
    if (location.pathname.includes('/jobs/') && location.pathname.includes('/edit')) return 'Edit Job Posting';
    if (location.pathname.includes('/jobs')) return 'Manage Job Listings';
    if (location.pathname.includes('/applicants') || location.pathname.includes('/applications')) return 'Candidate Pipeline';
    if (location.pathname.includes('/candidates')) return 'Candidate Search';
    if (location.pathname.includes('/interviews')) return 'Interview Schedules';
    if (location.pathname.includes('/company')) return 'Company Organization Profile';
    if (location.pathname.includes('/profile')) return 'Recruiter Profile';
    if (location.pathname.includes('/ai-tools') || location.pathname.includes('/ai')) return 'Recruiter AI Tools';
    if (location.pathname.includes('/messages')) return 'Messages & InMail';
    if (location.pathname.includes('/notifications')) return 'Notifications';
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