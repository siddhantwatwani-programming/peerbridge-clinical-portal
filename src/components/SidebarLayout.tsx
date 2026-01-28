import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';

export const SidebarLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-60">
        <TopHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
