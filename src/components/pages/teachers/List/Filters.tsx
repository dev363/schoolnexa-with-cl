import React, { useState } from 'react';
import { Form, Row, Col, Button, InputGroup, Collapse } from 'react-bootstrap';
import { Card } from '@/components/common';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { TeacherFilters as FilterState, DepartmentItem, DesignationItem } from '@/components/pages/teachers/types';
import { useTheme } from '@/context/ThemeContext';
import {
  TEACHER_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
} from '@/components/pages/teachers/constants';

interface TeacherFiltersProps {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onClear: () => void;
  departments: DepartmentItem[];
  designations: DesignationItem[];
  totalCount: number;
  filteredCount: number;
}

export const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  filters,
  onChange,
  onClear,
  departments,
  designations,
  totalCount,
  filteredCount,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isFilterApplied =
    filters.searchTerm.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.employmentType !== 'ALL' ||
    filters.department !== 'ALL' ||
    filters.designation !== 'ALL' ||
    filters.gender !== 'ALL' ||
    filters.qualification.trim() !== '' ||
    filters.joiningYear !== 'ALL';

  return (
    <Card
      bg={isDark ? 'dark' : 'white'}
      text={isDark ? 'white' : 'dark'}
      className="border mb-3 shadow-sm"
    >
      <Card.Body className="p-3">
        {/* Primary Row: Search + Quick Dropdowns + Toggle Advanced */}
        <Row className="g-2 align-items-center">
          <Col xs={12} md={4} lg={4}>
            <InputGroup size="sm">
              <InputGroup.Text
                className={
                  isDark ? 'bg-secondary bg-opacity-25 border-secondary text-light' : 'bg-light'
                }
              >
                <Search size={15} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search Teacher ID, Name, Mobile, Email..."
                value={filters.searchTerm}
                onChange={(e) => onChange({ searchTerm: e.target.value })}
                className={isDark ? 'bg-dark text-white border-secondary' : ''}
              />
              {filters.searchTerm && (
                <Button
                  variant={isDark ? 'outline-secondary' : 'outline-light'}
                  className="text-muted border-start-0"
                  onClick={() => onChange({ searchTerm: '' })}
                >
                  <X size={14} />
                </Button>
              )}
            </InputGroup>
          </Col>

          <Col xs={6} md={2} lg={2}>
            <Form.Select
              size="sm"
              value={filters.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className={isDark ? 'bg-dark text-white border-secondary' : ''}
            >
              <option value="ALL">All Status</option>
              {TEACHER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} md={2} lg={2}>
            <Form.Select
              size="sm"
              value={filters.department}
              onChange={(e) => onChange({ department: e.target.value })}
              className={isDark ? 'bg-dark text-white border-secondary' : ''}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} md={2} lg={2}>
            <Form.Select
              size="sm"
              value={filters.employmentType}
              onChange={(e) => onChange({ employmentType: e.target.value })}
              className={isDark ? 'bg-dark text-white border-secondary' : ''}
            >
              <option value="ALL">All Employment</option>
              {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col
            xs={6}
            md={2}
            lg={2}
            className="d-flex align-items-center gap-1.5 justify-content-end"
          >
            <Button
              variant={isDark ? 'outline-secondary' : 'outline-primary'}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="d-flex align-items-center gap-1 flex-grow-1 justify-content-center"
            >
              <Filter size={13} />
              <span>More</span>
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </Button>

            {isFilterApplied && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={onClear}
                title="Clear all filters"
                className="d-flex align-items-center px-2"
              >
                <X size={14} />
              </Button>
            )}
          </Col>
        </Row>

        {/* Collapsible Advanced Filters */}
        <Collapse in={showAdvanced}>
          <div className="pt-2.5 mt-2.5 border-top">
            <Row className="g-2">
              <Col xs={12} sm={6} md={3}>
                <Form.Label className="small text-muted mb-1">Designation</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.designation}
                  onChange={(e) => onChange({ designation: e.target.value })}
                  className={isDark ? 'bg-dark text-white border-secondary' : ''}
                >
                  <option value="ALL">All Designations</option>
                  {designations.map((des) => (
                    <option key={des.id} value={des.name}>
                      {des.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={6} sm={6} md={3}>
                <Form.Label className="small text-muted mb-1">Gender</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.gender}
                  onChange={(e) => onChange({ gender: e.target.value })}
                  className={isDark ? 'bg-dark text-white border-secondary' : ''}
                >
                  <option value="ALL">All Genders</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={6} sm={6} md={3}>
                <Form.Label className="small text-muted mb-1">Qualification Search</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="e.g. M.Sc., B.Ed., Ph.D."
                  value={filters.qualification}
                  onChange={(e) => onChange({ qualification: e.target.value })}
                  className={isDark ? 'bg-dark text-white border-secondary' : ''}
                />
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Label className="small text-muted mb-1">Joining Year</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.joiningYear}
                  onChange={(e) => onChange({ joiningYear: e.target.value })}
                  className={isDark ? 'bg-dark text-white border-secondary' : ''}
                >
                  <option value="ALL">All Years</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020 & Earlier</option>
                </Form.Select>
              </Col>
            </Row>
          </div>
        </Collapse>

        {/* Results summary pill */}
        <div className="d-flex align-items-center justify-content-between mt-2 pt-1 small text-muted">
          <div>
            Showing <strong className={isDark ? 'text-white' : 'text-dark'}>{filteredCount}</strong>{' '}
            of {totalCount} teachers
            {isFilterApplied && ' (filtered)'}
          </div>
          {isFilterApplied && (
            <button
              onClick={onClear}
              className="btn btn-link btn-sm p-0 text-decoration-none text-danger"
              style={{ fontSize: '0.78rem' }}
            >
              Reset filters
            </button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export const Filters = TeacherFilters;
export default TeacherFilters;

