import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input';
import { authAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiError } from '@/services/api';

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
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<LoginError>('none');
  const [loginAttempts, setLoginAttempts] = useState(0);

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

    try {
      const response = await authAPI.signIn({ email, password });
      
      // Properly type the role to match our User interface
      const userRole = response.role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
      
      // Use the auth context to manage login state
      login(response.accessToken, {
        username: response.username,
        role: userRole,
      });

      // Reset error state
      setLoginError('none');
      setLoginAttempts(0);

      // Redirect to main page using React Router
      navigate('/', { replace: true });
      
    } catch (error) {
      const apiError = error as ApiError;
      
      // Increment login attempts
      setLoginAttempts((prev) => prev + 1);
      
      // Handle different error cases
      if (apiError.status === 401 || apiError.status === 403) {
        if (loginAttempts + 1 >= 3) {
          setLoginError('locked');
        } else {
          setLoginError('invalid');
        }
      } else if (apiError.status === 0) {
        // Network error
        setErrors({
          email: 'Unable to connect to server. Please try again.',
          password: 'Unable to connect to server. Please try again.',
        });
      } else {
        // Other errors
        setLoginError('invalid');
      }
      
      console.error('Login error:', apiError);
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
            className={getInputBorderClass('email')}
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
            className={getInputBorderClass('password')}
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
          className='w-full bg-green-200 text-white'
          disabled={loginError === 'locked'}
        >
          Sign In
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
