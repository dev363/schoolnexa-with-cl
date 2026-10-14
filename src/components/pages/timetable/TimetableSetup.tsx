import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Badge, Collapse } from 'react-bootstrap';
import {
  CalendarDays,
  Clock,
  Settings2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Zap,
  Info,
} from 'lucide-react';
import { DayOfWeek } from '@/types';
import { TimetableSetupConfig } from '@/services/timetable/types';
import { WEEK_DAYS } from '@/config/Options';

interface TimetableSetupProps {
  config: TimetableSetupConfig;
  onChangeConfig: (updated: TimetableSetupConfig) => void;
  academicYears: { id: string; name: string; isCurrent: boolean }[];
  onNext: () => void;
  onAutoSetupPrompt?: () => void;
}

export const TimetableSetup: React.FC<TimetableSetupProps> = ({
  config,
  onChangeConfig,
  academicYears,
  onNext,
  onAutoSetupPrompt,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleDay = (day: DayOfWeek) => {
    const currentDays = config.workingDays;
    let newDays: DayOfWeek[];
    if (currentDays.includes(day)) {
      if (currentDays.length === 1) return; // Keep at least one day
      newDays = currentDays.filter((d) => d !== day);
    } else {
      newDays = [...currentDays, day];
      // Keep canonical order
      newDays.sort((a, b) => {
        const order: DayOfWeek[] = [
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ];
        return order.indexOf(a) - order.indexOf(b);
      });
    }
    onChangeConfig({ ...config, workingDays: newDays });
  };

  const totalWeeklySlots = config.workingDays.length * config.periodsPerDay;

  return (
    <div
      id="timetable-setup-container"
      className="d-flex flex-column gap-4 max-w-4xl mx-auto w-100"
    >
      {/* Friendly Header */}
      <Card className="shadow-sm border">
        <Card.Body className="p-4 d-flex flex-column flex-sm-row sm:align-items-center justify-content-between gap-3">
          <div>
            <Badge
              bg="primary-subtle"
              text="primary"
              className="mb-2 d-inline-flex align-items-center gap-1"
            >
              <Sparkles size={12} />
              <span>Step 1 of 5</span>
            </Badge>
            <h2 className="h4 fw-bold mb-1">School Timetable Setup</h2>
            <p className="text-muted small mb-0">
              Set basic school hours and working days. SchoolNexa configures sensible defaults
              automatically.
            </p>
          </div>

          <div className="text-sm-end">
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              Weekly Slots / Section
            </div>
            <div className="h5 fw-bold text-primary font-monospace mb-0">
              {totalWeeklySlots} periods
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Main Settings Card */}
      <Card className="shadow-sm border">
        <Card.Body className="p-4 d-flex flex-column gap-4">
          <Row className="g-3">
            {/* Academic Year */}
            <Col md={6}>
              <Form.Group controlId="academic-year-select" className="mb-2.5">
                <Form.Label
                  className="small fw-bold text-uppercase text-muted"
                  style={{ fontSize: '0.72rem' }}
                >
                  Academic Year
                </Form.Label>
                <Form.Select
                  value={config.academicYearId}
                  onChange={(e) => onChangeConfig({ ...config, academicYearId: e.target.value })}
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isCurrent ? '(Current Active)' : ''}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  Academic session for timetable deployment
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Periods Per Day */}
            <Col md={6}>
              <Form.Group controlId="periods-per-day-input" className="mb-2.5">
                <Form.Label
                  className="small fw-bold text-uppercase text-muted"
                  style={{ fontSize: '0.72rem' }}
                >
                  Periods Per Day
                </Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Control
                    type="number"
                    min={4}
                    max={10}
                    value={config.periodsPerDay}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        periodsPerDay: Math.max(1, parseInt(e.target.value) || 6),
                      })
                    }
                    style={{ width: '90px' }}
                    className="font-monospace fw-bold"
                  />
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Recommended: <strong>6 periods</strong> (e.g. 6 periods × 6 days = 36 slots)
                  </span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Working Days Selector */}
          <div>
            <Form.Label
              className="small fw-bold text-uppercase text-muted mb-2 d-block"
              style={{ fontSize: '0.72rem' }}
            >
              Working Days ({config.workingDays.length} days selected)
            </Form.Label>
            <Row className="g-2">
              {WEEK_DAYS.map((dayItem) => {
                const isSelected = config.workingDays.includes(dayItem.id);
                return (
                  <Col xs={4} sm={2} key={dayItem.id}>
                    <Button
                      variant={isSelected ? 'primary' : 'outline-secondary'}
                      onClick={() => toggleDay(dayItem.id)}
                      className="w-100 py-2.5 px-1 d-flex flex-column align-items-center justify-content-center"
                      style={{ minHeight: '62px' }}
                    >
                      <span className="fw-bold small">{dayItem.short}</span>
                      <span
                        className="text-uppercase"
                        style={{ fontSize: '0.62rem', opacity: 0.85 }}
                      >
                        {dayItem.label}
                      </span>
                      {isSelected && <CheckCircle2 size={12} className="mt-1" />}
                    </Button>
                  </Col>
                );
              })}
            </Row>
            <Form.Text className="text-muted small d-block mt-2" style={{ fontSize: '0.72rem' }}>
              Monday–Saturday is selected by default for comprehensive school scheduling.
            </Form.Text>
          </div>

          {/* Timings & Break */}
          <div className="pt-3 border-top">
            <Row className="g-3">
              <Col sm={4}>
                <Form.Group controlId="school-start-time" className="mb-2.5">
                  <Form.Label
                    className="small fw-semibold mb-1 d-flex align-items-center gap-1"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <Clock size={12} className="text-muted" />
                    <span>School Start Time</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    size="sm"
                    value={config.schoolStartTime}
                    onChange={(e) => onChangeConfig({ ...config, schoolStartTime: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col sm={4}>
                <Form.Group controlId="period-duration" className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
                    Period Duration
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={config.periodDurationMinutes}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        periodDurationMinutes: parseInt(e.target.value) || 40,
                      })
                    }
                  >
                    <option value={35}>35 minutes</option>
                    <option value={40}>40 minutes (Standard)</option>
                    <option value={45}>45 minutes</option>
                    <option value={50}>50 minutes</option>
                    <option value={60}>60 minutes</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col sm={4}>
                <Form.Group controlId="break-after-period" className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
                    Break / Lunch Period
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={config.breakAfterPeriod}
                    onChange={(e) =>
                      onChangeConfig({ ...config, breakAfterPeriod: parseInt(e.target.value) || 3 })
                    }
                  >
                    <option value={2}>After Period 2 (20 mins)</option>
                    <option value={3}>After Period 3 (20 mins) — Default</option>
                    <option value={4}>After Period 4 (20 mins)</option>
                    <option value={0}>No Midday Break</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Smart Timetable Toggle */}
          <div className="p-3 rounded bg-primary-subtle bg-opacity-25 border border-primary-subtle d-flex align-items-start justify-content-between gap-3">
            <div className="d-flex align-items-start gap-2.5">
              <div
                className="rounded bg-primary text-white d-flex align-items-center justify-content-center shrink-0 mt-0.5"
                style={{ width: '28px', height: '28px' }}
              >
                <Zap size={14} />
              </div>
              <div>
                <div className="small fw-bold d-flex align-items-center gap-1.5">
                  <span>Smart Timetable Optimization</span>
                  <Badge bg="primary-subtle" text="primary" style={{ fontSize: '0.65rem' }}>
                    Recommended
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5" style={{ fontSize: '0.75rem' }}>
                  Automatically places core subjects (Math, English, Science) earlier in the day
                  when attention is highest, distributes subjects evenly across the week, and
                  prevents teacher overload.
                </p>
              </div>
            </div>
            <Form.Check
              type="switch"
              id="smart-timetable-switch"
              checked={config.smartTimetable}
              onChange={(e) => onChangeConfig({ ...config, smartTimetable: e.target.checked })}
              className="fs-5"
            />
          </div>

          {/* Collapsed Advanced Settings Section */}
          <div className="border rounded overflow-hidden">
            <Button
              variant="light"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-100 p-3 text-start d-flex align-items-center justify-content-between border-0 rounded-0 bg-body-tertiary"
              style={{ fontSize: '0.8rem' }}
            >
              <span className="d-flex align-items-center gap-2 fw-semibold">
                <Settings2 size={16} className="text-muted" />
                <span>Advanced Settings (Optional Constraints)</span>
              </span>
              <span className="d-flex align-items-center gap-1 text-muted small">
                <span>{showAdvanced ? 'Collapse' : 'Expand'}</span>
                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </Button>

            <Collapse in={showAdvanced}>
              <div className="p-4 bg-body border-top">
                <p className="text-muted small mb-3" style={{ fontSize: '0.75rem' }}>
                  These constraints fine-tune the timetable generation. All settings have sensible
                  defaults.
                </p>

                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Group controlId="max-periods-teacher" className="mb-2.5">
                      <Form.Label className="small fw-medium mb-1" style={{ fontSize: '0.75rem' }}>
                        Max periods per teacher per day
                      </Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        min={2}
                        max={8}
                        value={config.advancedSettings.maxPeriodsPerTeacherPerDay}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            advancedSettings: {
                              ...config.advancedSettings,
                              maxPeriodsPerTeacherPerDay: parseInt(e.target.value) || 5,
                            },
                          })
                        }
                      />
                      <Form.Text className="text-muted small" style={{ fontSize: '0.68rem' }}>
                        Default: 5 periods / day
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col sm={6}>
                    <Form.Group controlId="max-same-subject" className="mb-2.5">
                      <Form.Label className="small fw-medium mb-1" style={{ fontSize: '0.75rem' }}>
                        Max same subject periods per day
                      </Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        min={1}
                        max={3}
                        value={config.advancedSettings.maxSameSubjectPerDay}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            advancedSettings: {
                              ...config.advancedSettings,
                              maxSameSubjectPerDay: parseInt(e.target.value) || 2,
                            },
                          })
                        }
                      />
                      <Form.Text className="text-muted small" style={{ fontSize: '0.68rem' }}>
                        Default: 2 periods / day
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col sm={12} className="pt-2 border-top">
                    <Form.Check
                      type="checkbox"
                      id="allow-consecutive-check"
                      label={
                        <div>
                          <div className="small fw-semibold">
                            Allow consecutive periods of same subject
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            When enabled, double periods (e.g. 2 Math periods in a row) are
                            permitted.
                          </div>
                        </div>
                      }
                      checked={config.advancedSettings.allowConsecutive}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          advancedSettings: {
                            ...config.advancedSettings,
                            allowConsecutive: e.target.checked,
                          },
                        })
                      }
                    />
                  </Col>

                  <Col sm={12} className="pt-2 border-top">
                    <Form.Check
                      type="checkbox"
                      id="core-subjects-morning-check"
                      label={
                        <div>
                          <div className="small fw-semibold">
                            Prioritize Core Subjects in Morning
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            Places Mathematics, English, and Science in Periods 1–3 whenever
                            possible.
                          </div>
                        </div>
                      }
                      checked={config.advancedSettings.coreSubjectsMorning}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          advancedSettings: {
                            ...config.advancedSettings,
                            coreSubjectsMorning: e.target.checked,
                          },
                        })
                      }
                    />
                  </Col>

                  <Col sm={12} className="pt-2 border-top">
                    <Form.Check
                      type="checkbox"
                      id="activities-afternoon-check"
                      label={
                        <div>
                          <div className="small fw-semibold">
                            Place PE, Art & Activities in Afternoon
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            Schedules physical education, library, and arts in Periods 4–6.
                          </div>
                        </div>
                      }
                      checked={config.advancedSettings.activitiesAfternoon}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          advancedSettings: {
                            ...config.advancedSettings,
                            activitiesAfternoon: e.target.checked,
                          },
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>
        </Card.Body>
      </Card>

      {/* Action Navigation */}
      <div className="d-flex align-items-center justify-content-between pt-2">
        <div
          className="small text-muted d-flex align-items-center gap-1.5"
          style={{ fontSize: '0.75rem' }}
        >
          <Info size={14} className="text-muted" />
          <span>Next: Review or auto-fill weekly subject requirements.</span>
        </div>

        <Button
          id="btn-step1-next"
          variant="primary"
          onClick={onNext}
          className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold shadow-sm"
        >
          <span>Continue to Requirements</span>
          <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
    </div>
  );
};
