import AuthLogo from '../../../assets/images/auth-image.png';

const AuthImage = () => {
  return (
    <div className='flex h-[609px] w-[664px] items-center justify-center'>
      <img src={AuthLogo} alt='Green & Tasty Logo' className='h-auto max-w-full object-contain' />
    </div>
  );
};

export default AuthImage;
