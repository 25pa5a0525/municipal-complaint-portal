import React from 'react';
import { Clock, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase().trim();

  if (norm === 'pending') {
    return (
      <span className="status-badge pending">
        <Clock size={13} />
        Pending
      </span>
    );
  }

  if (norm === 'in progress' || norm === 'in-progress' || norm === 'under review') {
    return (
      <span className="status-badge in-progress">
        <RefreshCw size={13} className="spin-slow" />
        In Progress
      </span>
    );
  }

  if (norm === 'resolved') {
    return (
      <span className="status-badge resolved">
        <CheckCircle2 size={13} />
        Resolved
      </span>
    );
  }

  if (norm === 'rejected') {
    return (
      <span className="status-badge rejected">
        <XCircle size={13} />
        Rejected
      </span>
    );
  }

  return (
    <span className="status-badge">
      {status || 'Unknown'}
    </span>
  );
}
