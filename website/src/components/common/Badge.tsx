import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant =
  | 'paid'
  | 'due'
  | 'pending'
  | 'overdue'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'primary'
  | 'brand'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  }[size];

  const variantClasses: Record<BadgeVariant, string> = {
    paid: 'bg-[#DCFCE7] text-[#16845B] border border-[#BBF7D0]',
    success: 'bg-[#DCFCE7] text-[#16845B] border border-[#BBF7D0]',
    emerald: 'bg-[#DCFCE7] text-[#16845B] border border-[#BBF7D0]',

    due: 'bg-[#FEF3C7] text-[#B7791F] border border-[#FDE68A]',
    pending: 'bg-[#FEF3C7] text-[#B7791F] border border-[#FDE68A]',
    warning: 'bg-[#FEF3C7] text-[#B7791F] border border-[#FDE68A]',
    amber: 'bg-[#FEF3C7] text-[#B7791F] border border-[#FDE68A]',

    overdue: 'bg-[#FEE2E2] text-[#C0392B] border border-[#FECACA]',
    danger: 'bg-[#FEE2E2] text-[#C0392B] border border-[#FECACA]',
    rose: 'bg-[#FEE2E2] text-[#C0392B] border border-[#FECACA]',

    primary: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
    brand: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',

    neutral: 'bg-[#F2F4F7] text-[#475467] border border-[#E4E7EC]',
    slate: 'bg-[#F2F4F7] text-[#475467] border border-[#E4E7EC]',
  };

  const dotClasses: Record<BadgeVariant, string> = {
    paid: 'bg-[#16845B]',
    success: 'bg-[#16845B]',
    emerald: 'bg-[#16845B]',

    due: 'bg-[#B7791F]',
    pending: 'bg-[#B7791F]',
    warning: 'bg-[#B7791F]',
    amber: 'bg-[#B7791F]',

    overdue: 'bg-[#C0392B]',
    danger: 'bg-[#C0392B]',
    rose: 'bg-[#C0392B]',

    primary: 'bg-[#2563EB]',
    brand: 'bg-[#2563EB]',

    neutral: 'bg-[#667085]',
    slate: 'bg-[#667085]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full leading-none shrink-0 font-medium',
          sizeClasses,
          variantClasses[variant] || variantClasses.neutral,
          className
        )
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotClasses[variant] || dotClasses.neutral
          )}
        />
      )}
      {children}
    </span>
  );
};
