import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import UserIcon from '../../../assets/icons/user.png';
import PersonIcon from '../../../assets/icons/person.png';
import LogOutIcon from '../../../assets/icons/log-out.png';
import { useState, useRef, useEffect } from 'react';
import { UserRole } from '@/types/auth';

const UserButton = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.CUSTOMER:
        return 'Customer';
      case UserRole.WAITER:
        return 'Waiter';
      case UserRole.VISITOR:
        return 'Visitor';
      default:
        return 'User';
    }
  };

  const userData = {
    name: user?.username || 'User',
    role: user?.role ? getRoleDisplayName(user.role) : 'User',
    email: user?.email || 'user@example.com',
  };

  const handleLogout = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className='flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100'
      >
        <img src={UserIcon} alt='Profile' width={24} height={24} />
      </button>

      {isDropdownOpen && (
        <div className='absolute right-0 top-full z-[1000] mt-2 flex w-[216px] flex-col items-start rounded-lg bg-white p-6 shadow-[0px_0px_10px_4px_rgba(194,194,194,0.50)]'>
          <div className='flex w-full flex-col gap-1'>
            <div className='text-sm font-semibold leading-tight text-[#232323]'>
              {userData.name} ({userData.role})
            </div>
            <div className='text-xs leading-tight text-gray-600'>{userData.email}</div>
          </div>

          <div className='my-4 h-px w-[168px] bg-[#DADADA]'></div>

          <div className='flex w-full flex-col gap-2'>
            <Button
              className='w-full justify-start gap-3 bg-white px-3 py-2 text-sm text-[#232323] hover:bg-gray-50'
              onClick={() => {
                navigate('/profile');
                setIsDropdownOpen(false);
              }}
            >
              <img src={PersonIcon} alt='Profile' width={16} height={16} />
              My profile
            </Button>

            <Button
              className='w-full justify-start gap-3 bg-white px-3 py-2 text-sm text-[#232323] hover:bg-gray-50'
              onClick={() => {
                handleLogout();
                setIsDropdownOpen(false);
              }}
            >
              <img src={LogOutIcon} alt='Logout' width={16} height={16} />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserButton;
