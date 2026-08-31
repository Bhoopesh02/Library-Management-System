import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

export const Sidebar = ({ links, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <div className={styles.header}>
        <button 
          className={styles.logoContainer}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <div className={styles.logo}>
            <BookOpen color="white" size={24} />
          </div>
          <span className={styles.logoText}>Library</span>
        </button>
      </div>

      <ul className={styles.navMenu}>
        {links.map(l => (
          <li key={l.id} className={styles.navItem} title={!isExpanded ? l.text : undefined}>
            <NavLink 
              to={l.to} 
              end 
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <l.icon size={22} className={styles.navIcon} />
              <span className={styles.navText}>{l.text}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      
      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={onLogout} title={!isExpanded ? "Logout" : undefined}>
          <LogOut size={22} className={styles.navIcon} />
          <span className={styles.navText}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
