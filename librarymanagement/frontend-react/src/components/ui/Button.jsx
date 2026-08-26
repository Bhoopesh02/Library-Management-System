import React from 'react';
import styles from './Button.module.css';

export const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}, ref) => {
  const btnClass = `${styles.btn} ${styles[variant]} ${size === 'sm' ? styles.sm : ''} ${className}`;

  return (
    <button
      ref={ref}
      className={btnClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin" style={{ display: 'inline-block', width: '1em', height: '1em', border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
