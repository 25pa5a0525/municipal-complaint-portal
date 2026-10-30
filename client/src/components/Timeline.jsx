import React from 'react';
import { Check, Clock, AlertTriangle, XCircle, Search, Wrench, CheckCircle2 } from 'lucide-react';

export default function Timeline({ status, history = [] }) {
  const normStatus = (status || '').toLowerCase();
  const isRejected = normStatus === 'rejected';

  // Find rejection remark if rejected
  const rejectionEntry = isRejected
    ? history.slice().reverse().find(h => (h.new_status || '').toLowerCase() === 'rejected')
    : null;

  if (isRejected) {
    return (
      <div className="timeline-container">
        <div className="timeline-steps">
          <div className="timeline-step completed">
            <div className="timeline-icon">
              <Check size={20} />
            </div>
            <div className="timeline-label">Submitted</div>
            <div className="timeline-sublabel">Complaint Filed</div>
          </div>

          <div className="timeline-step completed">
            <div className="timeline-icon">
              <Check size={20} />
            </div>
            <div className="timeline-label">Under Review</div>
            <div className="timeline-sublabel">Department Inspected</div>
          </div>

          <div className="timeline-step rejected">
            <div className="timeline-icon">
              <XCircle size={22} />
            </div>
            <div className="timeline-label" style={{ color: '#DC2626' }}>Rejected</div>
            <div className="timeline-sublabel">Not Actionable</div>
          </div>
        </div>

        {/* Administrative rejection explanation callout */}
        <div className="rejected-notice">
          <div className="rejected-title">
            <AlertTriangle size={18} />
            Administrative Disposition: Complaint Rejected
          </div>
          <div className="rejected-desc">
            <strong>Official Remarks: </strong>
            {rejectionEntry?.admin_note || 'This complaint does not fall under municipal jurisdiction or was classified as non-actionable.'}
          </div>
        </div>
      </div>
    );
  }

  // Normal progression:
  // Step 1: Submitted (always completed if complaint exists)
  // Step 2: Under Review (completed if in-progress or resolved)
  // Step 3: In Progress (active if in-progress, completed if resolved)
  // Step 4: Resolved (completed if resolved)

  let step1Class = 'completed';
  let step2Class = 'upcoming';
  let step3Class = 'upcoming';
  let step4Class = 'upcoming';

  if (normStatus === 'pending') {
    step1Class = 'completed';
    step2Class = 'active';
  } else if (normStatus === 'in progress' || normStatus === 'in-progress') {
    step1Class = 'completed';
    step2Class = 'completed';
    step3Class = 'active';
  } else if (normStatus === 'resolved') {
    step1Class = 'completed';
    step2Class = 'completed';
    step3Class = 'completed';
    step4Class = 'completed';
  }

  return (
    <div className="timeline-container">
      <div className="timeline-steps">
        <div className={`timeline-step ${step1Class}`}>
          <div className="timeline-icon">
            {step1Class === 'completed' ? <Check size={20} /> : <Clock size={20} />}
          </div>
          <div className="timeline-label">Submitted</div>
          <div className="timeline-sublabel">Complaint Logged</div>
        </div>

        <div className={`timeline-step ${step2Class}`}>
          <div className="timeline-icon">
            {step2Class === 'completed' ? <Check size={20} /> : <Search size={20} />}
          </div>
          <div className="timeline-label">Under Review</div>
          <div className="timeline-sublabel">Ward Verification</div>
        </div>

        <div className={`timeline-step ${step3Class}`}>
          <div className="timeline-icon">
            {step3Class === 'completed' ? <Check size={20} /> : <Wrench size={20} />}
          </div>
          <div className="timeline-label">In Progress</div>
          <div className="timeline-sublabel">Field Action Taken</div>
        </div>

        <div className={`timeline-step ${step4Class}`}>
          <div className="timeline-icon">
            {step4Class === 'completed' ? <CheckCircle2 size={22} /> : <Check size={20} />}
          </div>
          <div className="timeline-label">Resolved</div>
          <div className="timeline-sublabel">Issue Closed</div>
        </div>
      </div>
    </div>
  );
}
