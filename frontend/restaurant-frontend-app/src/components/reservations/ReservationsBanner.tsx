import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubheadingImage from '../../assets/images/subheading.png';
import VegetarianIcon from '../../assets/icons/vegetarian-light.png';

const ReservationsBanner: React.FC = () => {
  const { user } = useAuth();

  const getFirstName = () => {
    if (!user?.username) return '';
    return user.username.split(' ')[0] || '';
  };

  const getLastName = () => {
    if (!user?.username) return '';
    const nameParts = user.username.split(' ');
    return nameParts.slice(1).join(' ') || '';
  };

  const getDisplayName = () => {
    const firstName = getFirstName();
    const lastName = getLastName();
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    }
    return 'Guest';
  };

  return (
    <div className='flex w-full justify-center'>
      <div className='relative w-full'>
        <img
          src={SubheadingImage}
          alt='Reservations Page Banner'
          className='h-[80px] w-full object-cover sm:h-[90px] md:h-[100px] lg:h-[104px]'
        />
        <div className='absolute inset-0 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10'>
          <h2 className='text-lg font-medium leading-tight text-white sm:text-xl md:text-2xl'>
            Hello, {getDisplayName()} (Customer)
          </h2>
          <img
            src={VegetarianIcon}
            alt='Vegetarian Logo'
            className='w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] md:h-[56px] md:w-[56px] lg:h-[68px] lg:w-[68px]'
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationsBanner; 