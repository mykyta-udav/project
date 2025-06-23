const Footer = () => {
  return (
    <footer className='border-t border-gray-200 bg-white py-3 sm:py-4'>
      <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:gap-0 sm:px-6 lg:px-4'>
        <div className='text-sm sm:text-base'>
          <span className='text-green-600'>Green</span> & Tasty
        </div>
        <div className='text-xs text-gray-500 sm:text-sm'>
          {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
