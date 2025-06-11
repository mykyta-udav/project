import React from 'react';
import Header from '@/components/shared/header/Header';
// @ts-expect-error Missing declaration file
import Footer from '@/components/shared/footer/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      {/* Main Content */}
      <main className='flex-grow'>{/* page content here */}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
