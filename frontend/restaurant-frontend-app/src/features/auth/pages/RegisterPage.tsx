import RegisterForm from '../components/RegisterForm';
import AuthImage from '../components/AuthImage';

const RegisterPage = () => {
  return (
    <div className='flex min-h-screen w-full items-center justify-center overflow-y-auto bg-neutral-100 lg:h-screen lg:overflow-hidden'>
      <div className='flex w-full max-w-7xl flex-col items-center justify-center px-4 py-6 sm:px-6 md:px-8'>
        <div className='mb-6 flex w-full justify-center lg:hidden'>
          <AuthImage />
        </div>

        <div className='flex w-full flex-col items-center justify-center gap-6 lg:flex-row lg:gap-8'>
          <div className='flex w-full flex-col items-center justify-center lg:w-1/2'>
            <RegisterForm />
          </div>

          <div className='hidden w-full flex-col items-center justify-center py-12 lg:flex lg:w-1/2'>
            <AuthImage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
