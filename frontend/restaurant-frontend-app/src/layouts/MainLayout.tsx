import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/shared/header/Header';
import Footer from '@/components/shared/footer/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />

      {/* Add this main section with Outlet */}
      <main className='flex-grow'>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
