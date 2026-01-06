// components/admin-dashboard/AdminDeadlinesClient.tsx
"use client";

import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDeadlinesClient({ milestones }: { milestones: any[] }) {
  const now = new Date();
  
  const categorized = {
    critical: milestones.filter(m => new Date(m.proof_deadline) < new Date(now.getTime() + 24 * 60 * 60 * 1000)),
    warning: milestones.filter(m => {
      const deadline = new Date(m.proof_deadline);
      return deadline >= new Date(now.getTime() + 24 * 60 * 60 * 1000) && 
             deadline < new Date(now.getTime() + 48 * 60 * 60 * 1000);
    }),
    ok: milestones.filter(m => new Date(m.proof_deadline) >= new Date(now.getTime() + 48 * 60 * 60 * 1000))
  };

  return (
    <div className="space-y-6">
      {/* Critical - Less than 24hrs */}
      {categorized.critical.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-red-700 uppercase flex items-center gap-2">
            <AlertTriangle size={16} /> Critical - Less than 24 Hours
          </h2>
          {categorized.critical.map(m => (
            <DeadlineCard key={m.id} milestone={m} urgency="critical" />
          ))}
        </div>
      )}

      {/* Warning - 24-48hrs */}
      {categorized.warning.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-orange-700 uppercase flex items-center gap-2">
            <Clock size={16} /> Warning - 24-48 Hours Remaining
          </h2>
          {categorized.warning.map(m => (
            <DeadlineCard key={m.id} milestone={m} urgency="warning" />
          ))}
        </div>
      )}

      {/* Ok - 48+ hrs */}
      {categorized.ok.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-green-700 uppercase flex items-center gap-2">
            <CheckCircle size={16} /> On Track - 48+ Hours Remaining
          </h2>
          {categorized.ok.map(m => (
            <DeadlineCard key={m.id} milestone={m} urgency="ok" />
          ))}
        </div>
      )}

      {milestones.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No pending proof submissions with active deadlines
        </div>
      )}
    </div>
  );
}

function DeadlineCard({ milestone, urgency }: { milestone: any; urgency: 'critical' | 'warning' | 'ok' }) {
  const colors = {
    critical: 'border-red-300 bg-red-50',
    warning: 'border-orange-300 bg-orange-50',
    ok: 'border-green-300 bg-green-50'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colors[urgency]}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{milestone.campaigns.title}</h3>
          <p className="text-sm text-gray-600">
            Phase {milestone.milestone_index + 1}: {milestone.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">NGO: {milestone.campaigns.ngo_name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase">Deadline</p>
          <p className="text-sm font-bold">{formatDistanceToNow(new Date(milestone.proof_deadline), { addSuffix: true })}</p>
          <p className="text-xs text-gray-500">{new Date(milestone.proof_deadline).toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <Link 
          href={`/campaigns/${milestone.campaign_id}`}
          className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
}