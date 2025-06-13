import { Button } from '@/components/ui/button';
import Logo from '../../../assets/icons/logo.svg';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className='flex h-[72px] items-center border-b border-gray-200 bg-white px-[40px]'>
      <div className='flex w-full items-center justify-between'>
        {/* Logo - 40px from left edge */}
        <div className='flex items-center'>
          <div className='w-[48px]'>
            <img src={Logo} alt='Green & Tasty vegetarian logo' width={48} height={48} />
          </div>
          <h1 className='font-poppins ml-2 text-[24px] font-medium leading-[24px]'>
            <span className='text-[#00AD0C]'>Green</span>
            <span className='text-[#232323]'> & Tasty</span>
          </h1>
        </div>

        {/* Nav */}
        <div className='flex items-center'>
          <div className='absolute left-1/2 flex -translate-x-1/2 transform items-center'>
            <a
              href='#'
              className='font-poppins mr-4 border-b-2 border-[#00AD0C] text-[20px] font-medium leading-[32px] text-[#00AD0C]'
            >
              Main page
            </a>
            <a
              href='#'
              className='font-poppins text-[20px] font-medium leading-[32px] text-[#232323] hover:text-[#00AD0C]'
            >
              Book a Table
            </a>
          </div>

          {/* Sign In */}
          <div className='ml-[480px]'>
            <Link to='/login'>
              <Button
                variant='secondary'
                size='large'
                className='w-[73px] rounded-lg border text-[14px] text-[#00AD0C] hover:bg-green-50'
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
