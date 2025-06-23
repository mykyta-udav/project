import { Button } from '@/components/ui/button';
import Logo from '../../../assets/icons/logo.svg';
import CartIcon from '../../../assets/icons/cart.png';
import NotificationIcon from '../../../assets/icons/notification.png';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Menu from './menu';
import UserButton from './user-button';

const Header = () => {
  const { isAuthenticated, isLoading, isCustomer, isWaiter } = useAuth();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  if (isLoading) {
    return (
      <header className='flex h-[72px] items-center border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-[40px]'>
        <div className='flex w-full items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center'>
            <div className='w-[32px] sm:w-[40px] lg:w-[48px]'>
              <img
                src={Logo}
                alt='Green & Tasty vegetarian logo'
                className='h-auto w-full object-contain'
              />
            </div>
            <h2 className='ml-2 text-[18px] font-medium leading-[20px] sm:text-[20px] sm:leading-[22px] lg:text-[24px] lg:leading-[24px]'>
              <span className='text-[#00AD0C]'>Green</span>
              <span className='text-[#232323]'> & Tasty</span>
            </h2>
          </div>

          {/* Loading indicator */}
          <div className='hidden lg:ml-[480px] lg:block'>
            <div className='h-10 w-20 animate-pulse rounded bg-gray-200'></div>
          </div>
          <div className='block lg:hidden'>
            <div className='h-8 w-16 animate-pulse rounded bg-gray-200'></div>
          </div>
        </div>
      </header>
    );
  }

  const renderNavigation = () => {
    if (!isAuthenticated) {
      // Visitors (unauthorized users)
      return (
        <div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center'>
          <Link
            to='/'
            className={`mr-4 text-[16px] font-medium leading-[32px] md:text-[18px] lg:text-[20px] ${
              isActivePath('/')
                ? 'border-b-2 border-[#00AD0C] text-[#00AD0C]'
                : 'text-[#232323] hover:text-[#00AD0C]'
            }`}
          >
            Main page
          </Link>
          <Link
            to='/booking'
            className='text-[16px] font-medium leading-[32px] text-[#232323] hover:text-[#00AD0C] md:text-[18px] lg:text-[20px]'
          >
            Book a Table
          </Link>
        </div>
      );
    }

    if (isCustomer()) {
      return (
        <div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center'>
          <Link
            to='/'
            className={`mr-4 text-[16px] font-medium leading-[32px] md:text-[18px] lg:text-[20px] ${
              isActivePath('/')
                ? 'border-b-2 border-[#00AD0C] text-[#00AD0C]'
                : 'text-[#232323] hover:text-[#00AD0C]'
            }`}
          >
            Main page
          </Link>
          <Link
            to='/booking'
            className='mr-4 text-[16px] font-medium leading-[32px] text-[#232323] hover:text-[#00AD0C] md:text-[18px] lg:text-[20px]'
          >
            Book a Table
          </Link>
          <Link
            to='/reservations'
            className={`text-[16px] font-medium leading-[32px] md:text-[18px] lg:text-[20px] ${
              isActivePath('/reservations')
                ? 'border-b-2 border-[#00AD0C] text-[#00AD0C]'
                : 'text-[#232323] hover:text-[#00AD0C]'
            }`}
          >
            Reservations
          </Link>
        </div>
      );
    }

    if (isWaiter()) {
      return (
        <div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center'>
          <Link
            to='/reservations'
            className={`mr-4 text-[16px] font-medium leading-[32px] md:text-[18px] lg:text-[20px] ${
              isActivePath('/reservations')
                ? 'border-b-2 border-[#00AD0C] text-[#00AD0C]'
                : 'text-[#232323] hover:text-[#00AD0C]'
            }`}
          >
            Reservations
          </Link>
          <Link
            to='/menu'
            className={`text-[16px] font-medium leading-[32px] md:text-[18px] lg:text-[20px] ${
              isActivePath('/menu')
                ? 'border-b-2 border-[#00AD0C] text-[#00AD0C]'
                : 'text-[#232323] hover:text-[#00AD0C]'
            }`}
          >
            Menu
          </Link>
        </div>
      );
    }

    return null;
  };

  const renderAuthSection = () => {
    if (!isAuthenticated) {
      // Visitors (unauthorized users)
      return (
        <Link to='/login'>
          <Button
            variant='secondary'
            size='large'
            className='w-[60px] rounded-lg border text-[12px] text-[#00AD0C] hover:bg-green-50 sm:w-[73px] sm:text-[14px]'
          >
            Sign In
          </Button>
        </Link>
      );
    }

    if (isCustomer()) {
      return (
        <div className='flex items-center gap-4'>
          <Link
            to='/cart'
            className='flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100'
          >
            <img src={CartIcon} alt='Cart' width={24} height={24} className='object-contain' />
          </Link>
          <UserButton />
        </div>
      );
    }

    if (isWaiter()) {
      return (
        <div className='flex items-center gap-4'>
          <button className='relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100'>
            <img
              src={NotificationIcon}
              alt='Notifications'
              width={24}
              height={24}
              className='object-contain'
            />
          </button>
          <UserButton />
        </div>
      );
    }

    return null;
  };

  return (
    <header className='relative flex h-[72px] items-center border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-[40px]'>
      <div className='flex w-full items-center justify-between'>
        {/* Logo */}
        <div className='flex items-center'>
          <div className='w-[32px] flex-shrink-0 sm:w-[40px] lg:w-[48px]'>
            <img
              src={Logo}
              alt='Green & Tasty vegetarian logo'
              className='h-auto w-full object-contain'
            />
          </div>
          <h2 className='ml-2 text-[18px] font-medium leading-[20px] sm:text-[20px] sm:leading-[22px] lg:text-[24px] lg:leading-[24px]'>
            <span className='text-[#00AD0C]'>Green</span>
            <span className='text-[#232323]'> & Tasty</span>
          </h2>
        </div>

        {/* Desktop nav - hidden on mobile and tablet */}
        <div className='hidden lg:block'>{renderNavigation()}</div>

        {/* Desktop auth section - hidden on mobile and tablet */}
        <div className='hidden lg:block'>{renderAuthSection()}</div>

        {/* Mobile menu - visible on mobile and tablet */}
        <div className='block lg:hidden'>
          <Menu />
        </div>
      </div>
    </header>
  );
};

export default Header;
