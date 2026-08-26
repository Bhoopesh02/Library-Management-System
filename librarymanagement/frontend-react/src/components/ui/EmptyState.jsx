import React from 'react';

export const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
      {Icon && <Icon size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />}
      <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{title}</h4>
      <p>{description}</p>
    </div>
  );
};
