import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input';
import eyeOpenedIcon from '@/assets/icons/eye-opened.png';
import eyeClosedIcon from '@/assets/icons/eye-closed.png';

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

const RegisterForm = () => {
  const navigate = useNavigate();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (isValid) {
      console.log('User registered successfully:', {
        firstName,
        lastName,
        email,
        password,
      });

      setTimeout(() => {
        navigate('/login');
      }, 100);
    }
  };

  return (
    <div className='flex w-full max-w-lg flex-col items-start px-4 py-8 sm:px-6'>
      <div className='mb-16 w-full'>
        <p className='text-sm text-neutral-900 sm:text-base'>LET'S GET YOU STARTED</p>
        <h2 className='text-h3 text-neutral-900 sm:text-h2'>Create an Account</h2>
      </div>

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
              required
              showPasswordStrength={password.length > 0}
              passwordStrength={passwordStrength}
            />
            <button
              type='button'
              className='absolute right-3 cursor-pointer'
              onClick={() => setShowPassword(!showPassword)}
              style={{ top: '46px' }}
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
              required
            />
            <button
              type='button'
              className='absolute right-3 cursor-pointer'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ top: '46px' }}
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
          disabled={!isValid}
        >
          Create an Account
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

export default RegisterForm;
