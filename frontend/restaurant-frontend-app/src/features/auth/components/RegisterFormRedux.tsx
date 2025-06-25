import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input';
import eyeOpenedIcon from '@/assets/icons/eye-opened.png';
import eyeClosedIcon from '@/assets/icons/eye-closed.png';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

interface PasswordValidationResult {
  main: string;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  length: boolean;
}

const validateName = (name: string, field: string): string => {
  if (!name) {
    return `${field} is required`;
  }

  if (name.length > 50 || !/^[a-zA-Z\-']+$/.test(name)) {
    return `${field} must be up to 50 characters. Only Latin letters, hyphens, and apostrophes are allowed.`;
  }
  return '';
};

const validateEmail = (email: string): string => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address. Please ensure it follows the format: username@domain.com';
  }
  return '';
};

const validatePassword = (password: string): PasswordValidationResult => {
  const validationResult: PasswordValidationResult = {
    main: '',
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    length: password.length >= 8 && password.length <= 16,
  };

  if (!password) {
    validationResult.main = 'Password is required';
  }
  return validationResult;
};

const validateConfirmPassword = (confirmPassword: string, password: string): string => {
  if (!confirmPassword) {
    return 'Confirm password is required';
  }

  if (confirmPassword !== password) {
    return 'Confirm password must match new password';
  }

  return '';
};

const calculatePasswordStrength = (
  passwordValidation: PasswordValidationResult
): 'weak' | 'medium' | 'strong' => {
  const validCriteria = [
    passwordValidation.uppercase,
    passwordValidation.lowercase,
    passwordValidation.number,
    passwordValidation.special,
    passwordValidation.length,
  ].filter(Boolean).length;

  if (validCriteria <= 2) return 'weak';
  if (validCriteria <= 4) return 'medium';
  return 'strong';
};

const RegisterFormRedux = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // redux state
  const { isLoading, error: authError, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    console.log('Redux Form - Current state:', { isLoading, authError, isAuthenticated });
  }, [isLoading, authError, isAuthenticated]);

  // local form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: {
      main: '',
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
      length: false,
    },
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBlur = (
    field: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword'
  ): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    const firstNameError = validateName(firstName, 'First name');
    const lastNameError = validateName(lastName, 'Last name');
    const emailError = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      password: passwordValidation,
      confirmPassword: confirmPasswordError,
    });

    setPasswordStrength(calculatePasswordStrength(passwordValidation));

    setIsValid(
      !firstNameError &&
        !lastNameError &&
        !emailError &&
        !passwordValidation.main &&
        passwordValidation.uppercase &&
        passwordValidation.lowercase &&
        passwordValidation.number &&
        passwordValidation.special &&
        passwordValidation.length &&
        !confirmPasswordError
    );
  }, [firstName, lastName, email, password, confirmPassword]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Redux Form - Submit started', { isValid, isLoading });

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) {
      console.log('Redux Form - Form is invalid, skipping submission');
      return;
    }

    const credentials = {
      username: `${firstName} ${lastName}`,
      email,
      password,
    };

    console.log('Redux Form - Dispatching registerUser with:', credentials);

    try {
      const result = await dispatch(registerUser(credentials)).unwrap();
      console.log('Redux Form - Registration successful:', result);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Redux Form - Registration failed:', error);
      // error is handled by Redux state and will be displayed via authError
    }
  };

  return (
    <div className='flex w-[496px] flex-col items-start px-2 py-4 sm:px-4'>
      <div className='mb-16 w-full'>
        <p className='text-sm text-neutral-900 sm:text-base'>LET'S GET YOU STARTED</p>
        <h2 className='text-h3 text-neutral-900 sm:text-h2'>Create an Account</h2>
      </div>

      {authError && (
        <div className='mb-8 flex w-full flex-wrap items-center gap-2 rounded-lg bg-[#FCE9ED] p-4'>
          <p
            className='text-[14px] font-[300] leading-[24px] text-[#B70B0B]'
            style={{ fontFamily: 'Poppins' }}
          >
            {authError}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='w-full'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row'>
          <div className='flex flex-1 flex-col items-start gap-1'>
            <InputField
              type='text'
              label='First Name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName')}
              placeholder='Enter your First Name'
              helperText='e.g. John'
              error={touched.firstName && errors.firstName ? true : undefined}
              className='w-full'
              required
            />
            {touched.firstName && errors.firstName && (
              <div style={{ fontSize: '12px', color: '#B70B0B', marginTop: '4px' }}>
                {errors.firstName}
              </div>
            )}
          </div>
          <div className='flex flex-1 flex-col items-start gap-1'>
            <InputField
              type='text'
              label='Last Name'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName')}
              placeholder='Enter your Last Name'
              helperText='e.g. Doe'
              error={touched.lastName && errors.lastName ? true : undefined}
              className='w-full'
              required
            />
            {touched.lastName && errors.lastName && (
              <div style={{ fontSize: '12px', color: '#B70B0B', marginTop: '4px' }}>
                {errors.lastName}
              </div>
            )}
          </div>
        </div>

        <div className='mb-6 flex flex-col items-start gap-1'>
          <InputField
            type='email'
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder='Enter your Email'
            helperText='e.g. username@domain.com'
            error={touched.email && errors.email ? true : undefined}
            className='w-full'
            required
          />
          {touched.email && errors.email && (
            <div style={{ fontSize: '12px', color: '#B70B0B', marginTop: '4px' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div className='mb-6 flex flex-col items-start gap-1'>
          <div className='relative w-full'>
            <InputField
              type={showPassword ? 'text' : 'password'}
              label='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder='Enter your Password'
              error={touched.password && errors.password.main ? true : undefined}
              className='w-full'
              required
              showPasswordStrength={password.length > 0}
              passwordStrength={passwordStrength}
            />
            <button
              type='button'
              className='absolute right-3 cursor-pointer'
              onClick={() => setShowPassword(!showPassword)}
              style={{ top: '45px' }}
            >
              <img
                src={showPassword ? eyeOpenedIcon : eyeClosedIcon}
                alt={showPassword ? 'Hide password' : 'Show password'}
                className='h-6 w-6'
              />
            </button>
          </div>

          {touched.password && errors.password.main && (
            <div style={{ fontSize: '12px', color: '#B70B0B', marginTop: '4px' }}>
              {errors.password.main}
            </div>
          )}

          <ul className='mt-2 list-inside list-disc' style={{ fontSize: '12px' }}>
            <li
              style={{
                color:
                  password.length === 0
                    ? '#898989'
                    : errors.password.uppercase
                      ? '#00AD0C'
                      : '#B70B0B',
              }}
            >
              At least one uppercase letter required
            </li>
            <li
              style={{
                color:
                  password.length === 0
                    ? '#898989'
                    : errors.password.lowercase
                      ? '#00AD0C'
                      : '#B70B0B',
              }}
            >
              At least one lowercase letter required
            </li>
            <li
              style={{
                color:
                  password.length === 0
                    ? '#898989'
                    : errors.password.number
                      ? '#00AD0C'
                      : '#B70B0B',
              }}
            >
              At least one number required
            </li>
            <li
              style={{
                color:
                  password.length === 0
                    ? '#898989'
                    : errors.password.special
                      ? '#00AD0C'
                      : '#B70B0B',
              }}
            >
              At least one special character required
            </li>
            <li
              style={{
                color:
                  password.length === 0
                    ? '#898989'
                    : errors.password.length
                      ? '#00AD0C'
                      : '#B70B0B',
              }}
            >
              Password must be 8-16 characters long
            </li>
          </ul>
        </div>

        <div className='mb-16 flex flex-col items-start gap-1'>
          <div className='relative w-full'>
            <InputField
              type={showConfirmPassword ? 'text' : 'password'}
              label='Confirm New Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder='Confirm New Password'
              error={touched.confirmPassword && errors.confirmPassword ? true : undefined}
              className='w-full'
              required
            />
            <button
              type='button'
              className='absolute right-3 cursor-pointer'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ top: '45px' }}
            >
              <img
                src={showConfirmPassword ? eyeOpenedIcon : eyeClosedIcon}
                alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                className='h-6 w-6'
              />
            </button>
          </div>

          {touched.confirmPassword && errors.confirmPassword && (
            <div style={{ fontSize: '12px', color: '#B70B0B', marginTop: '4px' }}>
              {errors.confirmPassword}
            </div>
          )}

          <ul className='mt-2 list-inside list-disc' style={{ fontSize: '12px' }}>
            <li
              style={{
                color: !touched.confirmPassword
                  ? '#898989'
                  : !errors.confirmPassword
                    ? '#00AD0C'
                    : '#B70B0B',
              }}
            >
              Confirm password must match new password
            </li>
          </ul>
        </div>

        <Button
          type='submit'
          variant='primary'
          size='extra-large'
          className='w-full bg-green-200 text-white'
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className='mt-4 w-full text-start'>
        <span className='text-caption text-neutral-600'>Already have an account?</span>{' '}
        <Link to='/login' className='text-link text-blue-400 underline decoration-solid'>
          Login
        </Link>{' '}
        <span className='text-caption text-neutral-600'>instead</span>
      </div>
    </div>
  );
};

export default RegisterFormRedux;