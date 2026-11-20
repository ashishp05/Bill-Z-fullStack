import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  hint,
  type = 'text',
  className,
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="bz-field w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-appText-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-appText-muted pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={inputType}
          className={twMerge(
            clsx(
              'w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-appText-primary placeholder-appText-muted transition-all duration-150 outline-none',
              'focus:ring-2 focus:ring-primary/20 focus:border-primary',
              leftIcon ? 'pl-10' : '',
              isPassword || rightIcon ? 'pr-10' : '',
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-surface-border hover:border-gray-300',
              className
            )
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 text-appText-muted hover:text-appText-primary p-1 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3 text-appText-muted flex items-center">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-error font-medium" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-appText-secondary">{hint}</p>
      ) : null}
    </div>
  );
};
