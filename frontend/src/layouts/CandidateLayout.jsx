import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export const CandidateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/profile')) return 'Candidate Profile';
    if (location.pathname.includes('/applications')) return 'My Applications';
    if (location.pathname.includes('/saved-jobs')) return 'Saved Jobs';
    if (location.pathname.includes('/ai-tools') || location.pathname.includes('/ai')) return 'AI Career Studio';
    if (location.pathname.includes('/assessments')) return 'Skill Assessments';
    if (location.pathname.includes('/interviews')) return 'My Interviews';
    if (location.pathname.includes('/messages')) return 'Messages & InMail';
    if (location.pathname.includes('/notifications')) return 'Notifications';
    return 'Candidate Dashboard';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="CANDIDATE"
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

export default CandidateLayout;