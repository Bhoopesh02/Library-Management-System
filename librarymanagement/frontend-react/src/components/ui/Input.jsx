import React from 'react';
import styles from './Input.module.css';

export const Input = React.forwardRef(({ label, type = 'text', id, error, containerStyle, ...props }, ref) => {
  return (
    <div className={styles.formGroup} style={containerStyle}>
      {label && (
        <label className={styles.formLabel} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        className={styles.formControl}
        {...props}
      />
      {error && <span style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
