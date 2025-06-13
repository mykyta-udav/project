const Footer = () => {
  return (
    <footer className='border-t border-gray-200 bg-white py-4'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4'>
        <div className='text-sm'>
          <span className='text-green-600'>Green</span> & Tasty
        </div>
        <div className='text-xs text-gray-500'>{new Date().getFullYear()} All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
