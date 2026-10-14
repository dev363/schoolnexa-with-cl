import React from 'react';
import { Card, ProgressBar, ListGroup, Stack } from 'react-bootstrap';
import { Sparkles, CheckCircle2, Loader2, Check } from 'lucide-react';
import { TimetableGenerator } from '@/services/timetable/timetableGenerator';

interface TimetableGenerationProgressProps {
  completedStepKeys: string[];
  currentStepKey: string;
  progressPercent: number;
  isFinished: boolean;
}

export const TimetableGenerationProgress: React.FC<TimetableGenerationProgressProps> = ({
  completedStepKeys,
  currentStepKey,
  progressPercent,
  isFinished,
}) => {
  const steps = TimetableGenerator.GENERATION_STEPS;

  return (
    <Card
      id="timetable-generation-progress"
      className="shadow border mx-auto my-4 overflow-hidden"
      style={{ maxWidth: '540px' }}
    >
      <Card.Body className="p-4 d-flex flex-column gap-4">
        <div className="text-center">
          <div
            className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center mx-auto mb-2.5 p-2"
            style={{ width: '48px', height: '48px' }}
          >
            {isFinished ? (
              <CheckCircle2 size={28} className="text-success" />
            ) : (
              <Sparkles size={28} className="text-primary" />
            )}
          </div>
          <h3 className="h5 fw-bold mb-1">
            {isFinished ? 'Timetable Generated Successfully!' : 'Generating your timetable...'}
          </h3>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
            {isFinished
              ? 'All sections and teachers have been scheduled clash-free. Preparing preview...'
              : 'SchoolNexa is assembling your classes, teachers, and periods without clashes.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="d-flex flex-column gap-1.5">
          <div
            className="d-flex align-items-center justify-content-between small text-muted font-monospace"
            style={{ fontSize: '0.75rem' }}
          >
            <span>{isFinished ? 'Completed 100%' : 'Optimization in progress...'}</span>
            <span className="fw-bold">{progressPercent}%</span>
          </div>
          <ProgressBar
            now={Math.max(5, progressPercent)}
            animated={!isFinished}
            variant={isFinished ? 'success' : 'primary'}
            style={{ height: '8px' }}
          />
        </div>

        {/* Friendly Steps List */}
        <ListGroup
          variant="flush"
          className="border-top pt-2 gap-1"
          style={{ maxHeight: '280px', overflowY: 'auto' }}
        >
          {steps.map((step) => {
            const isDone = completedStepKeys.includes(step.key) || isFinished;
            const isCurrent = currentStepKey === step.key && !isFinished;

            return (
              <ListGroup.Item
                key={step.key}
                className={`d-flex align-items-center gap-2.5 py-1.5 px-2 rounded small border-0 ${
                  isDone
                    ? 'bg-success-subtle text-success fw-medium'
                    : isCurrent
                      ? 'bg-primary-subtle text-primary fw-bold'
                      : 'text-muted bg-transparent'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center shrink-0"
                  style={{ width: '20px', height: '20px' }}
                >
                  {isDone ? (
                    <Check size={16} className="text-success" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="text-primary animate-spin" />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary-subtle"
                      style={{ width: '8px', height: '8px' }}
                    />
                  )}
                </div>
                <span>{step.label}</span>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
