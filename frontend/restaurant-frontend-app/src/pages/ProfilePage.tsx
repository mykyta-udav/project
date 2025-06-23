import { useState } from 'react';
import ProfileForm from '@/components/profile/ProfileForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import ProfileBanner from '@/components/profile/ProfileBanner';

type TabType = 'general' | 'password';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  return (
    <div className='profile-page min-h-screen bg-gray-50'>
      <ProfileBanner />

      <div className='container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8'>
        {/* Mobile & Tablet Layout */}
        <div className='block lg:hidden'>
          {/* Mobile Tabs */}
          <div className='mb-6'>
            <div className='flex rounded-t-lg border-b border-gray-200 bg-white'>
              <button
                onClick={() => setActiveTab('general')}
                className={`relative min-h-[48px] flex-1 px-4 py-3 text-center text-sm font-medium transition-colors sm:text-base ${
                  activeTab === 'general'
                    ? 'border-b-2 border-[#00AD0C] bg-green-50 text-[#00AD0C]'
                    : 'text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
                }`}
              >
                <span className='block sm:inline'>General</span>
                <span className='block sm:ml-1 sm:inline'>Information</span>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`relative min-h-[48px] flex-1 px-4 py-3 text-center text-sm font-medium transition-colors sm:text-base ${
                  activeTab === 'password'
                    ? 'border-b-2 border-[#00AD0C] bg-green-50 text-[#00AD0C]'
                    : 'text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
                }`}
              >
                <span className='block sm:inline'>Change</span>
                <span className='block sm:ml-1 sm:inline'>Password</span>
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className='w-full'>
            {activeTab === 'general' && <ProfileForm />}
            {activeTab === 'password' && <ChangePasswordForm />}
          </div>
        </div>

        {/* Desktop */}
        <div className='hidden lg:block'>
          <div className='mx-auto flex max-w-6xl items-start justify-center'>
            {/* Desktop */}
            <div className='flex w-64 flex-shrink-0 flex-col items-start pt-8'>
              <button
                onClick={() => setActiveTab('general')}
                className={`relative mb-2 w-full rounded-lg px-4 py-2 text-left text-[18px] font-medium transition-colors ${
                  activeTab === 'general'
                    ? 'bg-green-50 text-[#00AD0C]'
                    : 'text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
                }`}
              >
                General Information
                {activeTab === 'general' && (
                  <div className='absolute bottom-0 left-0 top-0 w-1 rounded-r bg-[#00AD0C]'></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`relative w-full rounded-lg px-4 py-2 text-left text-[18px] font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'bg-green-50 text-[#00AD0C]'
                    : 'text-[#232323] hover:bg-gray-50 hover:text-[#00AD0C]'
                }`}
              >
                Change Password
                {activeTab === 'password' && (
                  <div className='absolute bottom-0 left-0 top-0 w-1 rounded-r bg-[#00AD0C]'></div>
                )}
              </button>
            </div>

            {/* Desktop */}
            <div className='ml-8 flex-1'>
              {activeTab === 'general' && <ProfileForm />}
              {activeTab === 'password' && <ChangePasswordForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
