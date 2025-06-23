// import { useForm } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';

// interface ChangePasswordFormData {
//   currentPassword: string;
//   newPassword: string;
//   confirmPassword: string;
// }

const ChangePasswordForm = () => {
  // const {
  //   register,
  //   handleSubmit,
  //   watch,
  //   formState: { errors },
  // } = useForm<ChangePasswordFormData>({
  //   mode: 'onChange',
  // });

  // const newPassword = watch('newPassword');

  // const onSubmit = (data: ChangePasswordFormData) => {
  //   console.log('Change password data:', data);
  //   // TODO: Implement password change functionality
  // };

  return (
    <div className='w-full'>
      <div className='relative mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white shadow-sm'>
        {/* <form onSubmit={handleSubmit(onSubmit)} className='p-4 sm:p-6'>

        </form> */}
      </div>
    </div>
  );
};

export default ChangePasswordForm;
