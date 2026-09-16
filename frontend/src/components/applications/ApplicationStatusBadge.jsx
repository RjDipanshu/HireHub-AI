import React from 'react';
import Badge from '../common/Badge';
import { Clock, CheckCircle2, XCircle, Calendar, Sparkles } from 'lucide-react';

export const ApplicationStatusBadge = ({ status = 'APPLIED' }) => {
  const getBadgeConfig = () => {
    switch (status.toUpperCase()) {
      case 'APPLIED':
        return { variant: 'primary', icon: Clock, label: 'Applied' };
      case 'REVIEWING':
        return { variant: 'ai', icon: Sparkles, label: 'In Review' };
      case 'SHORTLISTED':
        return { variant: 'warning', icon: Sparkles, label: 'Shortlisted' };
      case 'INTERVIEW_SCHEDULED':
        return { variant: 'primary', icon: Calendar, label: 'Interview' };
      case 'OFFERED':
      case 'HIRED':
        return { variant: 'success', icon: CheckCircle2, label: 'Offered' };
      case 'REJECTED':
        return { variant: 'danger', icon: XCircle, label: 'Not Selected' };
      case 'WITHDRAWN':
        return { variant: 'secondary', icon: XCircle, label: 'Withdrawn' };
      default:
        return { variant: 'primary', icon: Clock, label: status };
    }
  };

  const { variant, icon: Icon, label } = getBadgeConfig();

  return (
    <Badge variant={variant} icon={Icon}>
      {label}
    </Badge>
  );
};

export default ApplicationStatusBadge;
