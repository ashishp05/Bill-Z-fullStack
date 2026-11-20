import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  className,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  }[padding];

  return (
    <div
      className={twMerge(
        clsx(
          'bz-card bg-white border border-surface-border rounded-2xl shadow-card transition-all duration-150',
          hoverable && 'hover:shadow-elevated hover:border-gray-300',
          paddingClasses,
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
