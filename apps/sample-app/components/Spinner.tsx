import classNames from 'classnames';
import Image from 'next/image';
import { overrideTailwindClasses } from 'tailwind-override';
import lightSpinner from '../assets/lightSpinner.svg';
import darkSpinner from '../assets/spinner.svg';

export interface SpinnerProps {
  altText?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export function Spinner({ altText = 'Loading', className, variant = 'dark' }: SpinnerProps) {
  return (
    <Image
      className={overrideTailwindClasses(classNames('flex-0 mx-auto h-5 w-5 animate-spin', className))}
      src={variant === 'dark' ? darkSpinner : lightSpinner}
      alt={altText}
    />
  );
}
