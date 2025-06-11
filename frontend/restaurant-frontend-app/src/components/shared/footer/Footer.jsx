import vegetarianIcon from '../../../assets/vegetarian-icon.svg';

const Footer = () => {
  return (
    <footer className='footer-container bg-white border-t border-gray-200 py-4'>
      <div className='footer-content max-w-7xl mx-auto px-[40px] flex flex-col sm:flex-row justify-between items-center'>
        <div className='flex items-center mb-3 sm:mb-0'>
          <img src={vegetarianIcon} alt='Green & Tasty logo' width={24} height={24} />
          <span className='ml-2 text-sm'>
            <span className='text-[#00AD0C]'>Green</span>
            <span className='text-[#232323]'> & Tasty</span>
          </span>
        </div>

        <div className='text-xs text-gray-500'>
          © {new Date().getFullYear()} Green & Tasty. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
