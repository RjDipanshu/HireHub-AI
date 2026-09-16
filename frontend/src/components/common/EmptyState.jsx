import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable Empty State component for lists, dashboards, and search results
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action = null,
  className = '',
  style = {},
}) => {
  return (
    <div className={`empty-state ${className}`} style={style}>
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
