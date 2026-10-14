import React, { useState } from 'react';
import { Form, InputGroup, Button, Row, Col, Badge, Collapse } from 'react-bootstrap';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { StudentFilterState } from '../types';
import { STUDENT_STATUS } from '@/config/Options';
import { useTheme } from '@/context/ThemeContext';
import { AdvancedFilterFields } from './AdvancedFilterFields';
import { ActiveFilterPills } from './ActiveFilterPills';

interface StudentFiltersProps {
  filters: StudentFilterState;
  onChange: (newFilters: Partial<StudentFilterState>) => void;
  onClear: () => void;
  availableClasses?: string[];
  availableSections?: string[];
  availableAcademicYears?: string[];
  totalCount?: number;
  filteredCount?: number;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  filters,
  onChange,
  onClear,
  availableClasses = [],
  availableSections = [],
  availableAcademicYears = [],
  totalCount,
  filteredCount,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Count active advanced filters
  let activeAdvancedCount = 0;
  if (filters.currentSection !== 'ALL') activeAdvancedCount += 1;
  if (filters.gender !== 'ALL') activeAdvancedCount += 1;
  if (filters.admissionType !== 'ALL') activeAdvancedCount += 1;
  if (filters.admissionStatus !== 'ALL') activeAdvancedCount += 1;
  if (filters.bloodGroup !== 'ALL') activeAdvancedCount += 1;
  if (filters.specialCategory !== 'ALL') activeAdvancedCount += 1;
  if (filters.category !== 'ALL') activeAdvancedCount += 1;
  if (filters.guardianStatus !== 'ALL') activeAdvancedCount += 1;
  if (filters.academicYear !== 'ALL') activeAdvancedCount += 1;
  if (filters.sortBy && filters.sortBy !== 'name_asc') activeAdvancedCount += 1;

  const isFiltered =
    filters.searchQuery.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.currentClass !== 'ALL' ||
    activeAdvancedCount > 0;

  return (
    <div
      className={`p-3 rounded border mb-3 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white border-light-subtle shadow-sm'}`}
    >
      {/* Primary Quick Filter Row */}
      <Row className="g-2 align-items-center">
        {/* Search Input */}
        <Col xs={12} md={5} lg={4}>
          <InputGroup size="sm">
            <InputGroup.Text
              className={
                isDark ? 'bg-secondary bg-opacity-25 text-white border-secondary' : 'bg-light'
              }
            >
              <Search size={14} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search name, code, admission no, phone, city..."
              value={filters.searchQuery}
              onChange={(e) => onChange({ searchQuery: e.target.value })}
              className={isDark ? 'bg-dark text-white border-secondary' : ''}
              aria-label="Search students"
            />
            {filters.searchQuery && (
              <Button
                variant={isDark ? 'outline-secondary' : 'outline-light'}
                className="text-muted"
                onClick={() => onChange({ searchQuery: '' })}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={14} />
              </Button>
            )}
          </InputGroup>
        </Col>

        {/* Quick Class Selector */}
        <Col xs={6} sm={4} md={3} lg={2}>
          <Form.Select
            size="sm"
            value={filters.currentClass}
            onChange={(e) => onChange({ currentClass: e.target.value })}
            className={isDark ? 'bg-dark text-white border-secondary' : ''}
            aria-label="Filter by Class"
          >
            <option value="ALL">All Classes</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
            <option value="UNASSIGNED">Unassigned / No Class</option>
          </Form.Select>
        </Col>

        {/* Status Selector */}
        <Col xs={6} sm={4} md={2} lg={2}>
          <Form.Select
            size="sm"
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as any })}
            className={isDark ? 'bg-dark text-white border-secondary' : ''}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            {STUDENT_STATUS.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Action Controls: Advanced Toggle + Clear */}
        <Col
          xs={12}
          sm={4}
          md={2}
          lg={4}
          className="d-flex align-items-center justify-content-sm-end gap-1.5 flex-wrap"
        >
          <Button
            variant={
              showAdvanced || activeAdvancedCount > 0
                ? 'primary'
                : isDark
                  ? 'outline-secondary'
                  : 'outline-secondary'
            }
            size="sm"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="d-inline-flex align-items-center gap-1.5"
            aria-expanded={showAdvanced}
            aria-label="Toggle advanced filters"
          >
            <SlidersHorizontal size={13} />
            <span>Advanced</span>
            {activeAdvancedCount > 0 && (
              <Badge
                bg={showAdvanced ? 'light' : 'primary'}
                text={showAdvanced ? 'dark' : 'white'}
                pill
                style={{ fontSize: '10px' }}
              >
                {activeAdvancedCount}
              </Badge>
            )}
            {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </Button>

          {isFiltered && (
            <Button
              variant={isDark ? 'outline-secondary' : 'outline-secondary'}
              size="sm"
              onClick={onClear}
              className="d-inline-flex align-items-center gap-1 text-danger"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </Button>
          )}

          {typeof totalCount === 'number' && typeof filteredCount === 'number' && (
            <div
              className="text-muted small ms-auto ms-sm-2 text-nowrap"
              style={{ fontSize: '11.5px' }}
            >
              <span className="fw-semibold text-body">{filteredCount}</span>
              {filteredCount !== totalCount && <span> of {totalCount}</span>}
            </div>
          )}
        </Col>
      </Row>

      {/* Advanced Collapsible Filter Section */}
      <Collapse in={showAdvanced}>
        <div>
          <AdvancedFilterFields
            filters={filters}
            onChange={onChange}
            availableSections={availableSections}
            availableAcademicYears={availableAcademicYears}
          />
        </div>
      </Collapse>

      {/* Active Filter Pills Bar */}
      <ActiveFilterPills filters={filters} onChange={onChange} onClear={onClear} />
    </div>
  );
};
