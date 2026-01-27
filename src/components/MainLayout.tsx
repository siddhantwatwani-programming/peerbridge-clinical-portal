import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
