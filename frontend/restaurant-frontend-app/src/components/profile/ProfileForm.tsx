import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import avatarImage from '@/assets/images/avatar.png';
import photoIcon from '@/assets/icons/photo.png';

interface ProfileFormData {
  firstName: string;
  lastName: string;
}

const ProfileForm = () => {
  const { user, isAuthenticated } = useAuth();

  const getFirstName = () => {
    if (user?.firstName) return user.firstName;
    if (!user?.username) return '';
    return user.username.split(' ')[0] || '';
  };

  const getLastName = () => {
    if (user?.lastName) return user.lastName;
    if (!user?.username) return '';
    const nameParts = user.username.split(' ');
    return nameParts.slice(1).join(' ') || '';
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: getFirstName(),
      lastName: getLastName(),
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log('Profile data:', data);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center text-gray-600'>Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='relative mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white shadow-sm'>
        <form onSubmit={handleSubmit(onSubmit)} className='p-4 sm:p-6'>
          {/* Mobile Layout */}
          <div className='block lg:hidden'>
            {/* Avatar Section - Mobile */}
            <div className='mb-6 flex flex-col items-center'>
              <div className='mb-4 flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full bg-gray-100 sm:h-[150px] sm:w-[150px]'>
                <img
                  src={avatarImage}
                  alt='Profile Avatar'
                  className='h-full w-full object-cover'
                />
              </div>
              <Button
                type='button'
                className='flex h-[40px] items-center justify-center gap-2 rounded border border-gray-300 bg-white px-4 text-[14px] text-gray-700 hover:bg-gray-50'
              >
                <img src={photoIcon} alt='Photo' className='h-5 w-5' />
                Upload Photo
              </Button>
            </div>

            {/* User Info - Mobile */}
            <div className='mb-6 text-center'>
              <p className='mb-1 text-sm font-medium leading-6 text-gray-900'>
                {user.username} (Customer)
              </p>
              <p className='break-all text-sm leading-6 text-gray-600'>{user.email}</p>
            </div>

            {/* Form Fields - Mobile */}
            <div className='space-y-4'>
              <div className='flex flex-col'>
                <label className='mb-2 block text-sm font-medium leading-6 text-gray-700'>
                  First Name
                </label>
                <Input
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  className={`h-[48px] w-full sm:h-[56px] ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder='Enter your first name'
                />
                {!errors.firstName && <p className='mt-1 text-xs text-gray-500'>e.g. Johnson</p>}
                {errors.firstName && (
                  <p className='mt-1 text-xs text-red-500'>{errors.firstName.message}</p>
                )}
              </div>

              <div className='flex flex-col'>
                <label className='mb-2 block text-sm font-medium leading-6 text-gray-700'>
                  Last Name
                </label>
                <Input
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  className={`h-[48px] w-full sm:h-[56px] ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder='Enter your last name'
                />
                {!errors.lastName && <p className='mt-1 text-xs text-gray-500'>e.g. Doe</p>}
                {errors.lastName && (
                  <p className='mt-1 text-xs text-red-500'>{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Save Button - Mobile */}
            <div className='mt-8 flex justify-center'>
              <Button
                type='submit'
                className='h-[48px] w-full rounded bg-green-600 text-[14px] font-medium text-white hover:bg-green-700 sm:h-[56px] sm:w-[200px]'
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className='hidden lg:flex lg:h-[280px]'>
            <div className='flex flex-col'>
              <div className='flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-full bg-gray-100'>
                <img
                  src={avatarImage}
                  alt='Profile Avatar'
                  className='h-full w-full object-cover'
                />
              </div>

              <Button
                type='button'
                className='ml-8 mt-4 flex h-[30px] w-[140px] items-center justify-center gap-2 rounded border border-gray-300 bg-white text-[14px] text-gray-700 hover:bg-gray-50'
              >
                <img src={photoIcon} alt='Photo' className='h-6 w-6' />
                Upload Photo
              </Button>
            </div>

            <div className='relative ml-6 flex flex-1 flex-col'>
              <div className='mb-6'>
                <p className='mb-1 text-sm font-medium leading-6 text-gray-900'>
                  {user.username} (Customer)
                </p>
                <p className='text-sm leading-6 text-gray-600'>{user.email}</p>
              </div>

              <div className='flex gap-4'>
                <div className='flex flex-col'>
                  <label className='mb-1 block text-sm font-medium leading-6 text-gray-700'>
                    First Name
                  </label>
                  <Input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                    className={`h-[56px] w-[243px] ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder='Enter your first name'
                  />
                  {!errors.firstName && <p className='mt-1 text-xs text-gray-500'>e.g. Johnson</p>}
                  {errors.firstName && (
                    <p className='mt-1 text-xs text-red-500'>{errors.firstName.message}</p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='mb-1 block text-sm font-medium leading-6 text-gray-700'>
                    Last Name
                  </label>
                  <Input
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                    className={`h-[56px] w-[243px] ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder='Enter your last name'
                  />
                  {!errors.lastName && <p className='mt-1 text-xs text-gray-500'>e.g. Doe</p>}
                  {errors.lastName && (
                    <p className='mt-1 text-xs text-red-500'>{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className='absolute bottom-0 right-0'>
                <Button
                  type='submit'
                  className='h-[56px] w-[136px] rounded bg-green-600 text-[14px] font-medium text-white hover:bg-green-700'
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
