import React from 'react';
import styles from './Table.module.css';

export const Table = ({ children }) => (
  <div className={styles.tableContainer}>
    <table className={styles.table}>
      {children}
    </table>
  </div>
);
