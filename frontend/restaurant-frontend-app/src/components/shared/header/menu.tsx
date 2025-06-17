import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu as MenuIcon } from 'lucide-react';
import CartIcon from '../../../assets/icons/cart.png';
import NotificationIcon from '../../../assets/icons/notification.png';
import PersonIcon from '../../../assets/icons/person.png';
import LogOutIcon from '../../../assets/icons/log-out.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { UserRole } from '@/types/auth';

const Menu = () => {
  const { isAuthenticated, isCustomer, isWaiter, logout, user } = useAuth();
  const navigate = useNavigate();

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

  const renderMobileNavigation = () => {
    if (!isAuthenticated) {
      // Visitors (unauthorized users)
      return (
        <div className='flex flex-col gap-4'>
          <Link
            to='/'
            className='font-poppins border-b-2 border-[#00AD0C] pb-1 text-[18px] font-medium leading-[22px] text-[#00AD0C]'
          >
            Main page
          </Link>
          <a
            href='#'
            className='font-poppins text-[18px] font-medium leading-[22px] text-[#232323] hover:text-[#00AD0C]'
          >
            Book a Table
          </a>
          <Link to='/login'>
            <Button
              variant='secondary'
              className='mt-4 w-full rounded-lg border text-[16px] text-[#00AD0C] hover:bg-green-50'
            >
              Sign In
            </Button>
          </Link>
        </div>
      );
    }

    if (isCustomer()) {
      return (
        <div className='flex flex-col gap-4'>
          <Link
            to='/'
            className='font-poppins text-[18px] font-medium leading-[22px] text-[#232323] hover:text-[#00AD0C]'
          >
            Main page
          </Link>
          <a
            href='#'
            className='font-poppins text-[18px] font-medium leading-[22px] text-[#232323] hover:text-[#00AD0C]'
          >
            Book a Table
          </a>
          <Link
            to='/reservations'
            className='font-poppins text-[18px] font-medium leading-[22px] text-[#232323] hover:text-[#00AD0C]'
          >
            Reservations
          </Link>

          {/* Customer actions */}
          <div className='mt-6 border-t border-gray-200 pt-6'>
            <Link
              to='/cart'
              className='flex items-center gap-3 py-2 text-[16px] font-medium text-[#232323] hover:text-[#00AD0C]'
            >
              <img src={CartIcon} alt='Cart' width={20} height={20} className='object-contain' />
              Cart
            </Link>

            {/* buttons */}
            <Button
              className='mt-2 w-full justify-start gap-3 bg-white px-0 py-2 text-[16px] font-medium text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
              onClick={() => {
                navigate('/profile');
              }}
            >
              <img
                src={PersonIcon}
                alt='Profile'
                width={20}
                height={20}
                className='object-contain'
              />
              My profile
            </Button>

            <Button
              className='mt-2 w-full justify-start gap-3 bg-white px-0 py-2 text-[16px] font-medium text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
              onClick={handleLogout}
            >
              <img
                src={LogOutIcon}
                alt='Logout'
                width={20}
                height={20}
                className='object-contain'
              />
              Sign Out
            </Button>
          </div>
        </div>
      );
    }

    if (isWaiter()) {
      return (
        <div className='flex flex-col gap-4'>
          <Link
            to='/reservations'
            className='font-poppins text-[18px] font-medium leading-[22px] text-[#232323] hover:text-[#00AD0C]'
          >
            Reservations
          </Link>
          <Link
            to='/menu'
            className='font-poppins text-[18px] font-medium leading-[22px] text-[#232323] hover:text-[#00AD0C]'
          >
            Menu
          </Link>

          {/* Waiter actions */}
          <div className='mt-6 border-t border-gray-200 pt-6'>
            <button className='flex items-center gap-3 py-2 text-[16px] font-medium text-[#232323] hover:text-[#00AD0C]'>
              <img
                src={NotificationIcon}
                alt='Notifications'
                width={20}
                height={20}
                className='object-contain'
              />
              Notifications
            </button>

            {/* buttons */}
            <Button
              className='mt-2 w-full justify-start gap-3 bg-white px-0 py-2 text-[16px] font-medium text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
              onClick={() => {
                navigate('/profile');
              }}
            >
              <img
                src={PersonIcon}
                alt='Profile'
                width={20}
                height={20}
                className='object-contain'
              />
              My profile
            </Button>

            <Button
              className='mt-2 w-full justify-start gap-3 bg-white px-0 py-2 text-[16px] font-medium text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
              onClick={handleLogout}
            >
              <img
                src={LogOutIcon}
                alt='Logout'
                width={20}
                height={20}
                className='object-contain'
              />
              Sign Out
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='flex justify-end'>
      <Sheet>
        <SheetTrigger className='flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100'>
          <MenuIcon size={24} />
        </SheetTrigger>
        <SheetContent className='flex flex-col bg-white'>
          <SheetTitle className='mb-6 text-xl font-semibold text-[#232323]'>
            <span className='text-[#00AD0C]'>Green</span> & Tasty
          </SheetTitle>

          {/* User Info  */}
          {isAuthenticated && (
            <div className='mb-6 border-b border-gray-200 pb-4'>
              <div className='text-sm font-semibold leading-tight text-[#232323]'>
                {userData.name} ({userData.role})
              </div>
              <div className='text-xs leading-tight text-gray-600'>{userData.email}</div>
            </div>
          )}

          {/* Navigation */}
          <div className='flex-1'>{renderMobileNavigation()}</div>

          <SheetDescription className='sr-only'>
            Mobile navigation menu for Green & Tasty restaurant
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Menu;
