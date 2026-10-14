import React from 'react';
import { Card, Button, Form, Badge } from 'react-bootstrap';
import { UserPlus, TrendingUp, RotateCcw, ArrowLeftRight, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface AdmissionHeaderProps {
  selectedYear: string;
  availableYears: string[];
  onYearChange: (year: string) => void;
}

export const AdmissionHeader: React.FC<AdmissionHeaderProps> = ({
  selectedYear,
  availableYears,
  onYearChange,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { activeAcademicYear } = useAuth();
  const isDark = theme === 'dark';

  return (
    <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
      <Card.Body className="p-3">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '40px', height: '40px' }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                  Admissions & Enrollment
                </h5>
                <Badge bg="primary" className="fw-normal">
                  {selectedYear !== 'ALL'
                    ? `AY ${selectedYear}`
                    : activeAcademicYear?.name || 'Academic Year'}
                </Badge>
              </div>
              <p className="text-muted small mb-0 mt-0.5">
                Manage student admissions, promotions, transfers and repeat enrollments.
              </p>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Academic Year Selector */}
            <div
              className={`d-flex align-items-center gap-1 ${isDark ? 'bg-dark' : 'bg-light'} px-2 py-1 rounded border`}
            >
              <span className="text-muted small fw-medium text-nowrap">Session:</span>
              <Form.Select
                size="sm"
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className={`border-0 bg-transparent fw-semibold shadow-none py-0 pe-4 ${isDark ? 'text-light' : 'text-dark'}`}
                style={{ width: 'auto', cursor: 'pointer' }}
                aria-label="Filter by Academic Year"
              >
                <option value="ALL" className={isDark ? 'bg-dark text-light' : ''}>
                  All Academic Years
                </option>
                {availableYears.map((year) => (
                  <option key={year} value={year} className={isDark ? 'bg-dark text-light' : ''}>
                    AY {year} {year === '2026-2027' ? '(Current)' : ''}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Action Buttons */}
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => navigate('/admissions/new')}
            >
              <UserPlus size={14} />
              <span>New Admission</span>
            </Button>

            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => navigate('/admissions/promote')}
            >
              <TrendingUp size={14} />
              <span>Promote</span>
            </Button>

            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => navigate('/admissions/repeat')}
            >
              <RotateCcw size={14} />
              <span>Repeat</span>
            </Button>

            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => navigate('/admissions/transfer')}
            >
              <ArrowLeftRight size={14} />
              <span>Transfer</span>
            </Button>

            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => navigate('/admissions/bulk')}
            >
              <Layers size={14} />
              <span>Bulk</span>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
