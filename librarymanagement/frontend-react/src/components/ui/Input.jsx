import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

export const Input = React.forwardRef(({ label, type = 'text', id, error, containerStyle, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={styles.formGroup} style={containerStyle}>
      {label && (
        <label className={styles.formLabel} htmlFor={id}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          type={inputType}
          id={id}
          className={styles.formControl}
          {...props}
          style={{ ...(props.style || {}), paddingRight: isPassword ? '40px' : undefined }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
