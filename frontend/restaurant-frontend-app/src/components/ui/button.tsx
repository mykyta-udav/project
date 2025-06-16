import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none',
  {
    variants: {
      variant: {
        // Primary buttons
        primary: 'bg-green-200 text-white',

        // Secondary buttons
        secondary: 'border border-green-200 bg-white text-green-200',

        // Tertiary buttons
        tertiary: 'bg-transparent text-neutral-900',
      },
      size: {
        'extra-large': 'h-[56px] w-[145px] px-4 text-button-primary',
        large: 'h-[40px] w-[137px] px-4 text-button-primary',
        small: 'h-[32px] w-[91px] px-3 text-button-secondary',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'large',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // Handle hover and active (pressed) states via CSS classes
    const stateClass = cn({
      // Hover states
      'hover:bg-green-300': variant === 'primary' && !disabled,
      'hover:bg-green-100/10': variant === 'secondary' && !disabled,
      'hover:bg-neutral-100': variant === 'tertiary' && !disabled,

      // Active/Pressed states
      'active:bg-green-400': variant === 'primary' && !disabled,
      'active:bg-green-100/30': variant === 'secondary' && !disabled,
      'active:bg-neutral-200': variant === 'tertiary' && !disabled,

      // Disabled state
      'opacity-50 bg-neutral-400 border-neutral-400 text-white': disabled,
    });

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), stateClass, className)}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
