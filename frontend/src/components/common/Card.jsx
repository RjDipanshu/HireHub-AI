import React from 'react';

export const Card = ({
  children,
  variant = 'default', // 'default' | 'ai' | 'interactive'
  className = '',
  style = {},
  ...props
}) => {
  const variantClass =
    variant === 'ai' ? 'card-ai' : variant === 'interactive' ? 'card-interactive' : '';

  return (
    <div className={`card ${variantClass} ${className}`} style={style} {...props}>
      {children}
    </div>
  );
};

export default Card;
