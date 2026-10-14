import React from 'react';
import { Card, Button, Alert, Badge, Stack } from 'react-bootstrap';
import { AlertCircle, AlertTriangle, CheckCircle2, Wrench, ArrowRight } from 'lucide-react';
import { HumanProblemMessage } from '@/services/timetable/types';

interface TimetableConflictsProps {
  messages: HumanProblemMessage[];
  onAutoFix: () => void;
  onNavigateToStep2: () => void;
}

export const TimetableConflicts: React.FC<TimetableConflictsProps> = ({
  messages,
  onAutoFix,
  onNavigateToStep2,
}) => {
  if (messages.length === 0) {
    return (
      <Card className="shadow-sm border text-center p-5">
        <Card.Body>
          <div
            className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: '52px', height: '52px' }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h3 className="h6 fw-bold mb-1">No Clashes or Problems Found</h3>
          <p
            className="text-muted small mb-0 max-w-sm mx-auto"
            style={{ maxWidth: '360px', fontSize: '0.8rem' }}
          >
            Every section, subject, and teacher period has been scheduled with zero hard clashes and
            balanced weekly distribution.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between">
        <h3 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
          <AlertCircle size={16} className="text-danger" />
          <span>Issues Requiring Attention ({messages.length})</span>
        </h3>

        <Button
          variant="primary"
          size="sm"
          onClick={onAutoFix}
          className="d-inline-flex align-items-center gap-1.5 fw-semibold"
          style={{ fontSize: '0.78rem' }}
        >
          <Wrench size={13} />
          <span>Auto Fix All Issues</span>
        </Button>
      </div>

      <div className="d-flex flex-column gap-2.5">
        {messages.map((msg) => {
          const isHard = msg.type === 'HARD_CLASH' || msg.type === 'UNSCHEDULED';

          return (
            <Alert
              key={msg.id}
              variant={isHard ? 'danger' : 'warning'}
              className="p-3 mb-0 shadow-sm"
            >
              <div className="d-flex align-items-start gap-3">
                <div className="pt-0.5 shrink-0">
                  {isHard ? (
                    <AlertCircle size={18} className="text-danger" />
                  ) : (
                    <AlertTriangle size={18} className="text-warning" />
                  )}
                </div>

                <div className="flex-grow-1">
                  <h4 className="fw-bold small mb-1">{msg.title}</h4>
                  <p className="small mb-0 opacity-90" style={{ fontSize: '0.78rem' }}>
                    {msg.description}
                  </p>

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-top border-secondary-subtle">
                      <div
                        className="text-uppercase small fw-bold mb-1.5 opacity-75"
                        style={{ fontSize: '0.65rem' }}
                      >
                        Suggested Actions:
                      </div>
                      <div className="d-flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant="light"
                            size="sm"
                            onClick={() => {
                              if (action.includes('Auto Fix')) {
                                onAutoFix();
                              } else if (action.includes('Step 2') || action.includes('teacher')) {
                                onNavigateToStep2();
                              }
                            }}
                            className="border py-1 px-2 d-inline-flex align-items-center gap-1 small"
                            style={{ fontSize: '0.72rem' }}
                          >
                            <span>{action}</span>
                            <ArrowRight size={10} className="opacity-75" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          );
        })}
      </div>
    </div>
  );
};
