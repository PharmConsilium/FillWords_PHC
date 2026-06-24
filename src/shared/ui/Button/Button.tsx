import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'surface';
};

export const Button = ({ children, variant = 'primary', className, ...rest }: ButtonProps) => {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
};
