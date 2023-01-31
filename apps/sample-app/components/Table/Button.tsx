import classNames from 'classnames';
import { HTMLAttributes, ReactNode } from 'react';
import { overrideTailwindClasses } from 'tailwind-override';

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'unstyled';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  isLoading?: boolean;
}

export function Button({
  size = 'md',
  variant = 'primary',
  children,
  disabled = false,
  className,
  isLoading = false,
  ...otherProps
}: ButtonProps) {
  const buttonClassNames = overrideTailwindClasses(
    classNames(
      'inline-flex items-center rounded-md border font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      {
        'rounded px-2.5 py-1.5 text-xs': size === 'xs',
        'px-3 py-2 text-sm leading-4 ': size === 'sm',
        'px-4 py-2 text-sm ': size === 'md',
        'px-4 py-2 text-base font-medium': size === 'lg',
        'px-6 py-3 text-base font-medium': size === 'xl',
        'bg-primary hover:bg-primary text-white border-transparent': variant === 'primary',
        'bg-white hover:bg-gray-50 text-gray-700': variant === 'secondary',
        'opacity-50 cursor-not-allowed': disabled,
        'opacity-50 cursor-wait': isLoading,
      },
      className
    )
  );
  return (
    <button type="button" disabled={disabled || isLoading} className={buttonClassNames} {...otherProps}>
      {children}
    </button>
  );
}
