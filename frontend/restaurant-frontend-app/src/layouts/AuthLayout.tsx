import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className='flex-center min-h-screen w-full'>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
