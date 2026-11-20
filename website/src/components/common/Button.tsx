import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'orange' | 'navy' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-primary text-white hover:bg-primary-700 shadow-sm border border-primary font-semibold',
    orange:
      'bg-[#EA580C] text-white hover:bg-[#C2410C] shadow-sm border border-[#EA580C] font-semibold',
    navy:
      'bg-[#183153] text-white hover:bg-[#10223b] shadow-sm border border-[#183153] font-semibold',
    secondary:
      'bg-surface-bg text-appText-primary hover:bg-[#E4E7EC] border border-surface-border',
    outline:
      'bg-white border border-surface-border text-appText-primary hover:bg-surface-bg hover:border-gray-300 shadow-sm',
    ghost:
      'bg-transparent text-appText-secondary hover:text-appText-primary hover:bg-gray-100',
    danger:
      'bg-error text-white hover:bg-red-700 shadow-sm border border-error font-semibold',
  }[variant];

  return (
    <button
      className={twMerge(
        clsx(
          'bz-button', baseClasses,
          sizeClasses,
          variantClasses,
          fullWidth ? 'w-full' : '',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
