import React from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Search, X, Filter } from 'lucide-react';
import { EnrollmentFilterState } from '../types';

interface FilterBarProps {
  filters: EnrollmentFilterState;
  availableYears: string[];
  availableClasses: string[];
  availableSections: string[];
  onFilterChange: (updates: Partial<EnrollmentFilterState>) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const EnrollmentFilterBar: React.FC<FilterBarProps> = ({
  filters,
  availableYears,
  availableClasses,
  availableSections,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
}) => {
  const isFiltered =
    filters.searchQuery.trim() !== '' ||
    filters.className !== 'ALL' ||
    filters.sectionName !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.academicYear !== '2026-2027';

  return (
    <div className="bg-body-tertiary p-2 rounded border mb-3">
      <Row className="g-2 align-items-center">
        {/* Search input */}
        <Col xs={12} md={4} lg={3}>
          <InputGroup size="sm">
            <InputGroup.Text className="bg-body border-end-0 text-muted">
              <Search size={14} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search ID, student, admission #..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="border-start-0 ps-0"
              aria-label="Search enrollments"
            />
            {filters.searchQuery && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="border-start-0"
                title="Clear search"
              >
                <X size={13} />
              </Button>
            )}
          </InputGroup>
        </Col>

        {/* Academic Year */}
        <Col xs={6} sm={3} md={2} lg={2}>
          <Form.Select
            size="sm"
            value={filters.academicYear}
            onChange={(e) => onFilterChange({ academicYear: e.target.value })}
            aria-label="Filter by Academic Year"
          >
            <option value="ALL">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                AY {year}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Class */}
        <Col xs={6} sm={3} md={2} lg={2}>
          <Form.Select
            size="sm"
            value={filters.className}
            onChange={(e) => onFilterChange({ className: e.target.value })}
            aria-label="Filter by Class"
          >
            <option value="ALL">All Classes</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Section */}
        <Col xs={6} sm={3} md={2} lg={2}>
          <Form.Select
            size="sm"
            value={filters.sectionName}
            onChange={(e) => onFilterChange({ sectionName: e.target.value })}
            aria-label="Filter by Section"
          >
            <option value="ALL">All Sections</option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Status */}
        <Col xs={6} sm={3} md={2} lg={2}>
          <Form.Select
            size="sm"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="PROMOTED">Promoted</option>
            <option value="REPEAT">Repeat</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Form.Select>
        </Col>

        {/* Reset Button & Count */}
        <Col
          xs={12}
          lg={1}
          className="d-flex align-items-center justify-content-between justify-content-lg-end gap-2"
        >
          {isFiltered && (
            <Button
              variant="link"
              size="sm"
              onClick={onResetFilters}
              className="text-decoration-none text-muted p-0 d-flex align-items-center gap-1 small"
            >
              <X size={13} />
              <span>Reset</span>
            </Button>
          )}
          <span className="text-muted small text-nowrap ms-auto">
            {filteredCount} / {totalCount}
          </span>
        </Col>
      </Row>
    </div>
  );
};
