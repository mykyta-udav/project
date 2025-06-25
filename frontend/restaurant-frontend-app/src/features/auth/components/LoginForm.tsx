import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

type LoginError = 'none' | 'empty' | 'invalid' | 'locked';

const validateEmail = (email: string): string => {
  if (!email) {
    return 'Email address is required. Please enter your email to continue';
  }
  return '';
};

const validatePassword = (password: string): string => {
  if (!password) {
    return 'Password is required. Please enter your password to continue.';
  }
  return '';
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<LoginError>('none');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const handleBlur = (field: 'email' | 'password'): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (loginError === 'invalid' || loginError === 'locked') {
      setErrors({
        email: 'Incorrect email or password. Try again or create an account.',
        password: 'Incorrect email or password. Try again or create an account.',
      });
    } else {
      setErrors({
        email: emailError,
        password: passwordError,
      });
    }
  }, [email, password, loginError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (loginAttempts >= 3) {
      setLoginError('locked');
      return;
    }

    if (!email || !password) {
      setLoginError('empty');
      return;
    }

    setIsSubmitting(true);

    try {
      // store user role automatically
      await login({ email, password });

      setLoginError('none');
      setLoginAttempts(0);

      // will be available after the login promise resolves
      console.log('Login successful - user role will be automatically stored in AuthContext');

      navigate('/', { replace: true });
    } catch (error) {
      setLoginAttempts((prev) => prev + 1);

      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      if (errorMessage.includes('Invalid email or password')) {
        if (loginAttempts + 1 >= 3) {
          setLoginError('locked');
        } else {
          setLoginError('invalid');
        }
      } else if (errorMessage.includes('Network') || errorMessage.includes('connect')) {
        setErrors({
          email: 'Unable to connect. Please try again.',
          password: 'Unable to connect. Please try again.',
        });
      } else {
        setLoginError('invalid');
      }
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputError = (field: 'email' | 'password'): boolean => {
    if (loginError === 'invalid' || loginError === 'locked') {
      return true;
    }
    return touched[field] && !!errors[field];
  };

  const getInputBorderClass = (field: 'email' | 'password'): string => {
    if (loginError === 'invalid' || loginError === 'locked') {
      return 'border-[#B70B0B]';
    }
    if (touched[field] && errors[field]) {
      return 'border-[#B70B0B]';
    }
    if (touched[field] && !errors[field] && (field === 'email' ? email : password)) {
      return 'border-[#DADADA]';
    }
    return '';
  };

  return (
    <div className='flex w-full max-w-lg flex-col items-start px-4 py-8 sm:px-6'>
      <div className='mb-16 w-full'>
        <p className='text-sm text-neutral-900 sm:text-base'>WELCOME BACK</p>
        <h2 className='text-h3 text-neutral-900 sm:text-h2'>Sign In to Your Account</h2>
      </div>

      {loginError === 'locked' && (
        <div className='mb-8 flex w-full flex-wrap items-center gap-2 rounded-lg bg-[#FCE9ED] p-4'>
          <p
            className='text-[14px] font-[300] leading-[24px] text-[#B70B0B]'
            style={{ fontFamily: 'Poppins' }}
          >
            Your account is temporarily locked due to multiple failed login attempts. Please try
            again later.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='w-full'>
        <div className='mb-6 flex flex-col items-start gap-1'>
          <InputField
            type='email'
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder='Enter your Email'
            helperText={!getInputError('email') ? 'e.g. username@domain.com' : undefined}
            error={getInputError('email')}
            className={`w-[496px] ${getInputBorderClass('email')}`}
            required
          />
          {getInputError('email') && (
            <div style={{ fontSize: '12px', color: '#B70B0B', marginTop: '4px' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div className='mb-16 flex flex-col items-start gap-1'>
          <InputField
            type='password'
            label='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder='Enter your Password'
            error={getInputError('password')}
            className={`w-[496px] ${getInputBorderClass('password')}`}
            required
          />
          {getInputError('password') && (
            <div style={{ fontSize: '12px', color: '#B70B0B', marginTop: '4px' }}>
              {errors.password}
            </div>
          )}
        </div>

        <Button
          type='submit'
          variant='primary'
          size='extra-large'
          className='w-[496px] bg-green-200 text-white'
          disabled={loginError === 'locked' || isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className='mt-4 w-full text-start'>
        <span className='text-caption text-neutral-600'>Don't have an account?</span>{' '}
        <Link to='/register' className='text-link text-blue-400 underline decoration-solid'>
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
