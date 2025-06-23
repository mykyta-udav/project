import RegisterForm from '../components/RegisterForm';
import AuthImage from '../components/AuthImage';

const RegisterPage = () => {
  return (
    <div className='flex min-h-screen w-full items-center justify-center overflow-y-auto bg-neutral-100'>
      <div className='flex w-full max-w-7xl flex-col items-center justify-center px-2 py-2 sm:px-4 md:px-6'>
        <div className='mb-2 flex w-full justify-center lg:hidden'>
          <AuthImage />
        </div>

        <div className='flex w-full flex-col items-center justify-center gap-8 lg:flex-row lg:gap-[60px]'>
          <div className='flex w-full flex-col items-center justify-center lg:w-1/2'>
            <RegisterForm />
          </div>

          <div className='hidden w-full flex-col items-center justify-center py-6 lg:flex lg:w-1/2'>
            <AuthImage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
