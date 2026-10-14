import React from 'react';
import { Card } from '@/components/common';
import { TeacherActivityLog } from '@/components/pages/teachers/types';
import { useGetTeacherActivitiesQuery } from '@/store/teachers';

export interface ActivityViewProps {
  activityLogs?: TeacherActivityLog[];
  teacherId?: string;
}

const ActivityHeader: React.FC = () => (
  <Card.Header className="py-2.5 px-3">
    <span className="fw-bold small text-uppercase text-muted">
      Institutional Audit & Change Log
    </span>
  </Card.Header>
);

interface ActivityItemProps {
  log: TeacherActivityLog;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ log }) => (
  <div className="p-2.5 border rounded bg-light bg-opacity-25 small">
    <div className="d-flex align-items-center justify-content-between mb-1">
      <span className="fw-bold text-primary">{log.action}</span>
      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
        {log.date}
      </span>
    </div>
    <div>{log.description}</div>
    {log.actor && (
      <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
        Logged by: {log.actor}
      </div>
    )}
  </div>
);

const EmptyActivityState: React.FC = () => (
  <p className="text-muted small text-center py-4 mb-0">No activity logged.</p>
);

export const ActivityView: React.FC<ActivityViewProps> = ({ activityLogs: propLogs, teacherId }) => {
  const { data: remoteLogs } = useGetTeacherActivitiesQuery(teacherId!, {
    skip: !teacherId,
  });
  const activityLogs = remoteLogs ?? propLogs ?? [];

  return (
    <Card className="border shadow-sm">
      <ActivityHeader />
      <Card.Body className="p-3">
        {activityLogs.length === 0 ? (
          <EmptyActivityState />
        ) : (
          <div className="d-flex flex-column gap-2.5">
            {activityLogs.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export const ProfileActivityTab = ActivityView;
export default ActivityView;
