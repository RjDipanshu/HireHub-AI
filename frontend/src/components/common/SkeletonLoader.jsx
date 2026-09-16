import React from 'react';

/**
 * Reusable Skeleton Loader component for shimmering placeholder states
 * Supports variants: 'text', 'title', 'rect', 'circle', 'card'
 */
export const SkeletonLoader = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style = {},
}) => {
  const items = Array.from({ length: count });

  const getVariantClass = () => {
    switch (variant) {
      case 'title':
        return 'skeleton skeleton-title';
      case 'rect':
        return 'skeleton skeleton-rect';
      case 'circle':
        return 'skeleton skeleton-circle';
      case 'card':
        return 'skeleton-card';
      case 'text':
      default:
        return 'skeleton skeleton-text';
    }
  };

  if (variant === 'card') {
    return (
      <div className={`skeleton-card ${className}`} style={style}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-title" style={{ width: '45%' }} />
            <div className="skeleton skeleton-text" style={{ width: '70%' }} />
          </div>
        </div>
        <div className="skeleton skeleton-rect" style={{ height: '70px', marginTop: '0.5rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div className="skeleton skeleton-text" style={{ width: '20%', height: '1.5rem', borderRadius: '999px' }} />
          <div className="skeleton skeleton-text" style={{ width: '25%', height: '1.5rem', borderRadius: '999px' }} />
          <div className="skeleton skeleton-text" style={{ width: '20%', height: '1.5rem', borderRadius: '999px' }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`${getVariantClass()} ${className}`}
          style={{
            ...(width ? { width } : {}),
            ...(height ? { height } : {}),
            ...style,
          }}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
