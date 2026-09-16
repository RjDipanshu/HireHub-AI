import React from 'react';

export const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => {
  const dimension = size === 'sm' ? 18 : size === 'lg' ? 42 : 28;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '2.5rem',
    }}>
      <div
        className="spinner"
        style={{
          width: `${dimension}px`,
          height: `${dimension}px`,
          borderWidth: size === 'lg' ? '4px' : '3px',
        }}
      />
      {label && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
