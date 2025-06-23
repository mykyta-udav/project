import SubheadingImage from '../../assets/images/subheading.png';
import VegetarianIcon from '../../assets/icons/vegetarian-light.png';

const ProfileBanner = () => {
  return (
    <div className='flex w-full justify-center'>
      <div className='relative w-full'>
        <img
          src={SubheadingImage}
          alt='Profile Page Banner'
          className='h-[80px] w-full object-cover sm:h-[90px] md:h-[100px] lg:h-[104px]'
        />
        <div className='absolute inset-0 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10'>
          <h2 className='text-lg font-medium leading-tight text-white sm:text-xl md:text-2xl'>
            My Profile
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

export default ProfileBanner;
