import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface UserProfileProps {
  showRole?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ showRole = true, className = '' }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCurrentUserRoleDisplay } = useRoleAccess();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`user-profile ${className}`}>
      <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
        <div className='user-info flex-1'>
          <p className='text-sm font-medium text-gray-900 sm:text-base'>{user.username}</p>
          <p className='break-all text-xs text-gray-600 sm:text-sm'>{user.email}</p>
          {showRole && (
            <p className='mt-1 text-xs font-medium text-blue-600'>
              Role: {getCurrentUserRoleDisplay()}
            </p>
          )}
        </div>
        <button
          onClick={logout}
          className='min-h-[44px] self-start rounded border border-red-300 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-800 sm:min-h-0 sm:self-auto sm:px-3 sm:py-1'
        >
          Logout
        </button>
      </div>
    </div>
  );
};
