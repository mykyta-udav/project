import { Button } from '@/components/ui/button';
import vegetarianIcon from '../../../assets/vegetarian-icon.svg';

const Header = () => {
  return (
    <header className='header-container'>
      <div className='header-content'>
        {/* Logo */}
        <div className='logo-container'>
          <div className='logo-icon'>
            <img src={vegetarianIcon} alt='Green & Tasty vegetarian logo' width={48} height={48} />
          </div>
          <h1 className='logo-text ml-2'>
            <span className='logo-green'>Green</span>
            <span className='logo-dark'> & Tasty</span>
          </h1>
        </div>

        {/* Navigation */}
        <div className='nav-container'>
          <div className='nav-links-wrapper'>
            <a href='#' className='nav-link-active mr-4'>
              Main page
            </a>
            <a href='#' className='nav-link-inactive'>
              Book a Table
            </a>
          </div>

          {/* Sign In */}
          <div className='ml-[480px]'>
            <Button
              variant='outline'
              className='inline-flex items-center px-3 py-2 gap-2 rounded-[8px] border border-[#00AD0C] bg-white text-[#00AD0C] hover:bg-green-50'
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
