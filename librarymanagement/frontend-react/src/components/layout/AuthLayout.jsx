import React from 'react';
import styles from './AuthLayout.module.css';

export const AuthLayout = ({ leftContent, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.left}>
          {leftContent}
        </div>
        <div className={styles.right}>
          {children}
        </div>
      </div>
    </div>
  );
};
