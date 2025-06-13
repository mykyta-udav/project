import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    const hasError = error === true || typeof error === 'string';

    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-[56px] w-full rounded-[8px] bg-white px-4 py-4 text-body text-neutral-900',
          // Default border - grey
          'border border-[#898989]',
          // Focus styles - green border
          'focus:border-[#00AD0C] focus:outline-none focus:ring-0',
          // Hover styles - green shadow
          'transition-all hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.2)]',
          // Error state - red border
          hasError && 'border-[#B70B0B]',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          // File input styles
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          // Placeholder
          'placeholder:text-neutral-400',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface InputFieldProps extends InputProps {
  label?: string;
  helperText?: string;
  error?: boolean | string;
  valid?: boolean;
  showPasswordStrength?: boolean;
  passwordStrength?: 'weak' | 'medium' | 'strong';
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      helperText,
      error,
      valid,
      className,
      showPasswordStrength,
      passwordStrength,
      ...props
    },
    ref
  ) => {
    const hasError = error === true || typeof error === 'string';
    const errorMessage = typeof error === 'string' ? error : '';

    return (
      <div className='w-full space-y-1'>
        {label && (
          <div className='flex w-full items-center justify-between'>
            <label className='block text-body-bold text-neutral-900'>{label}</label>
            {showPasswordStrength && passwordStrength && (
              <div className='flex items-center gap-2'>
                <span
                  className={`h-2 w-2 rounded-full ${
                    passwordStrength === 'weak'
                      ? 'bg-red-400'
                      : passwordStrength === 'medium'
                        ? 'bg-orange-400'
                        : 'bg-green-200'
                  }`}
                ></span>
                <span className='text-xs capitalize'>{passwordStrength}</span>
              </div>
            )}
          </div>
        )}
        <div className='relative'>
          <Input
            error={hasError}
            className={cn(className, valid && 'border-[#00AD0C]')}
            ref={ref}
            {...props}
          />
        </div>
        {(errorMessage || helperText) && (
          <p
            className={cn(
              // Caption styling as specified
              'font-[Poppins] text-[12px] font-[300] leading-[16px]',
              hasError ? 'text-[#B70B0B]' : valid ? 'text-[#00AD0C]' : 'text-[#898989]'
            )}
          >
            {hasError ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);
InputField.displayName = 'InputField';

export { Input, InputField };
