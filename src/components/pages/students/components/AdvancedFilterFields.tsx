import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { StudentFilterState } from '../types';
import {
  GENDERS,
  ADMISSION_TYPES,
  BLOOD_GROUPS,
  SOCIAL_CATEGORIES,
  ADMISSION_STATUS_OPTIONS,
  GUARDIAN_STATUS_OPTIONS,
  SPECIAL_NEED_FILTER_OPTIONS,
  STUDENT_SORT_OPTIONS,
} from '@/config/Options';
import { useTheme } from '@/context/ThemeContext';

interface AdvancedFilterFieldsProps {
  filters: StudentFilterState;
  onChange: (newFilters: Partial<StudentFilterState>) => void;
  availableSections: string[];
  availableAcademicYears: string[];
}

export const AdvancedFilterFields: React.FC<AdvancedFilterFieldsProps> = ({
  filters,
  onChange,
  availableSections,
  availableAcademicYears,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const controlClass = isDark ? 'bg-dark text-white border-secondary' : '';

  return (
    <div
      className={`p-3 rounded border mt-2.5 ${isDark ? 'bg-dark-subtle border-secondary' : 'bg-light border-light-subtle'}`}
    >
      <Row className="g-2.5">
        {/* Section */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-section">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Section
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.currentSection}
              onChange={(e) => onChange({ currentSection: e.target.value })}
              className={controlClass}
              aria-label="Filter by Section"
            >
              <option value="ALL">All Sections</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Gender */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-gender">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Gender
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.gender}
              onChange={(e) => onChange({ gender: e.target.value as any })}
              className={controlClass}
              aria-label="Filter by Gender"
            >
              <option value="ALL">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Admission Type */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-admission-type">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Admission Type
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.admissionType}
              onChange={(e) => onChange({ admissionType: e.target.value as any })}
              className={controlClass}
              aria-label="Filter by Admission Type"
            >
              <option value="ALL">All Admission Types</option>
              {ADMISSION_TYPES.map((adm) => (
                <option key={adm.id} value={adm.id}>
                  {adm.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Enrollment / Active Admission */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-enrollment">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Enrollment Status
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.admissionStatus}
              onChange={(e) => onChange({ admissionStatus: e.target.value as any })}
              className={controlClass}
              aria-label="Filter by Enrollment Status"
            >
              {ADMISSION_STATUS_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Blood Group */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-blood-group">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Blood Group
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.bloodGroup}
              onChange={(e) => onChange({ bloodGroup: e.target.value })}
              className={controlClass}
              aria-label="Filter by Blood Group"
            >
              <option value="ALL">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg.id} value={bg.id}>
                  {bg.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Special Needs */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-special-needs">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Special Need / Condition
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.specialCategory}
              onChange={(e) => onChange({ specialCategory: e.target.value })}
              className={controlClass}
              aria-label="Filter by Special Needs"
            >
              {SPECIAL_NEED_FILTER_OPTIONS.map((sn) => (
                <option key={sn.id} value={sn.id}>
                  {sn.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Social Category */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-social-category">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Social Category
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className={controlClass}
              aria-label="Filter by Social Category"
            >
              <option value="ALL">All Categories</option>
              {SOCIAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Guardian Record */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-guardian-status">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Guardian Status
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.guardianStatus}
              onChange={(e) => onChange({ guardianStatus: e.target.value as any })}
              className={controlClass}
              aria-label="Filter by Guardian Status"
            >
              {GUARDIAN_STATUS_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Academic Year */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-academic-year">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Academic Year
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.academicYear}
              onChange={(e) => onChange({ academicYear: e.target.value })}
              className={controlClass}
              aria-label="Filter by Academic Year"
            >
              <option value="ALL">All Academic Years</option>
              {availableAcademicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Sort By */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filter-sort-by">
            <Form.Label className="small text-muted mb-1 fw-medium" style={{ fontSize: '11px' }}>
              Sort Students By
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value })}
              className={controlClass}
              aria-label="Sort Students By"
            >
              {STUDENT_SORT_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};
