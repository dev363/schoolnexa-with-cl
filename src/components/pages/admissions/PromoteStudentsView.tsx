import React, { useState, useMemo, useEffect } from 'react';
import { Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft, TrendingUp, CheckCircle2, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Enrollment } from './types';
import {
  useGetEnrollmentsQuery,
  usePromoteStudentsMutation,
} from '@/store/enrollment';
import { useGetClassesQuery, useGetSectionsQuery } from '@/store/academic';
import { PromotionCriteriaForm } from './components/PromotionCriteriaForm';
import { PromotionRosterTable } from './components/PromotionRosterTable';
import { PromotionPreviewModal } from './components/PromotionPreviewModal';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const PromoteStudentsView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();

  const preselectedStudentId = searchParams.get('studentId');
  const preselectedEnrollmentId = searchParams.get('sourceEnrollmentId');

  const { data: enrollmentsData } = useGetEnrollmentsQuery();
  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery();
  const [promoteStudentsMutation] = usePromoteStudentsMutation();

  const availableYears = useMemo(() => ['2026-2027', '2025-2026', '2024-2025'], []);
  const availableClasses = useMemo(() => {
    const raw = Array.isArray(classesData?.data) ? classesData.data : Array.isArray(classesData) ? classesData : [];
    if (raw.length > 0) return raw.map((c: any) => c.name || `Class ${c.numericOrder}`);
    return ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  }, [classesData]);

  const availableSections = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    if (raw.length > 0) {
      const names = Array.from(new Set(raw.map((s: any) => s.sectionName || s.name))).filter(Boolean);
      if (names.length > 0) return names as string[];
    }
    return ['Section A', 'Section B', 'Section C', 'Section D'];
  }, [sectionsData]);

  // Form State
  const [sourceYear, setSourceYear] = useState('2025-2026');
  const [targetYear, setTargetYear] = useState('2026-2027');
  const [sourceClass, setSourceClass] = useState('Class 5');
  const [targetClass, setTargetClass] = useState('Class 6');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'Section A',
    'Section B',
    'Section C',
  ]);

  // Roster Candidates State
  const [candidates, setCandidates] = useState<
    Array<{
      enrollment: Enrollment;
      targetSection: string;
      targetRollNumber?: string;
      alreadyEnrolledInTarget?: boolean;
      existingTargetEnrollmentId?: string;
    }>
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Preview & Execution State
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promotionResults, setPromotionResults] = useState<Enrollment[] | null>(null);

  // Helper to load roster
  const handleLoadRoster = () => {
    setIsLoadingRoster(true);
    const rawEnrollments = Array.isArray(enrollmentsData?.data)
      ? enrollmentsData.data
      : Array.isArray(enrollmentsData)
        ? enrollmentsData
        : [];

    // Filter eligible source enrollments
    const matching = rawEnrollments.filter((e: any) => {
      if (e.academicYearName !== sourceYear && e.academicYearId !== sourceYear) return false;
      if (e.className !== sourceClass) return false;
      if (!selectedSections.includes(e.sectionName)) return false;
      if (e.status === 'TRANSFERRED' || e.status === 'CANCELLED') return false;
      return true;
    });

    // Check target year duplicate for each candidate
    const mapped = matching.map((enr: any) => {
      const existingInTarget = rawEnrollments.find(
        (e: any) =>
          e.studentId === enr.studentId &&
          (e.academicYearName === targetYear || e.academicYearId === targetYear) &&
          e.status !== 'CANCELLED',
      );

      return {
        enrollment: enr,
        targetSection: enr.sectionName || 'Section A',
        targetRollNumber: enr.rollNumber || '',
        alreadyEnrolledInTarget: Boolean(existingInTarget),
        existingTargetEnrollmentId: existingInTarget?.enrollmentId || existingInTarget?.id,
      };
    });

    setCandidates(mapped);

    if (preselectedEnrollmentId) {
      const target = mapped.find((m: any) => m.enrollment.enrollmentId === preselectedEnrollmentId || m.enrollment.id === preselectedEnrollmentId);
      if (target && !target.alreadyEnrolledInTarget) {
        setSelectedIds([preselectedEnrollmentId]);
      } else {
        setSelectedIds([]);
      }
    } else {
      setSelectedIds(
        mapped.filter((m: any) => !m.alreadyEnrolledInTarget).map((m: any) => m.enrollment.enrollmentId || m.enrollment.id),
      );
    }

    setHasLoaded(true);
    setIsLoadingRoster(false);
  };

  // If URL has preselected student, configure source parameters automatically
  useEffect(() => {
    if (preselectedEnrollmentId && enrollmentsData) {
      const raw = Array.isArray(enrollmentsData?.data) ? enrollmentsData.data : Array.isArray(enrollmentsData) ? enrollmentsData : [];
      const enr = raw.find((e: any) => e.enrollmentId === preselectedEnrollmentId || e.id === preselectedEnrollmentId);
      if (enr) {
        setSourceYear(enr.academicYearName);
        setSourceClass(enr.className);
        // Compute logical next class
        const currentNum = parseInt(enr.className.replace(/\D/g, ''), 10);
        if (!isNaN(currentNum)) {
          setTargetClass(`Class ${currentNum + 1}`);
        }
        // Set target year to next academic year
        const nextYear = enr.academicYearName === '2025-2026' ? '2026-2027' : '2027-2028';
        setTargetYear(nextYear);
      }
    }
  }, [preselectedEnrollmentId, enrollmentsData]);

  // Section toggle handlers
  const handleToggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  const handleSelectAllSections = () => {
    if (selectedSections.length === availableSections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections([...availableSections]);
    }
  };

  // Student selection handlers
  const handleToggleSelect = (enrollmentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(enrollmentId)
        ? prev.filter((id) => id !== enrollmentId)
        : [...prev, enrollmentId],
    );
  };

  const handleSelectAll = () => {
    const eligible = candidates
      .filter((c) => !c.alreadyEnrolledInTarget)
      .map((c) => c.enrollment.enrollmentId);
    setSelectedIds(eligible);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  // Update target section per candidate
  const handleUpdateTargetSection = (enrollmentId: string, section: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.enrollment.enrollmentId === enrollmentId ? { ...c, targetSection: section } : c,
      ),
    );
  };

  const handleUpdateTargetRollNumber = (enrollmentId: string, roll: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.enrollment.enrollmentId === enrollmentId ? { ...c, targetRollNumber: roll } : c,
      ),
    );
  };

  const handleSetGlobalTargetSection = (section: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        selectedIds.includes(c.enrollment.enrollmentId) ? { ...c, targetSection: section } : c,
      ),
    );
  };

  // Build Preview List
  const previewItems = useMemo(() => {
    const yearPrefix = targetYear.split('-')[0] || '2026';
    return selectedIds
      .map((id, index) => {
        const candidate = candidates.find((c) => c.enrollment.enrollmentId === id);
        if (!candidate) return null;

        return {
          studentName: candidate.enrollment.studentName,
          studentCode: candidate.enrollment.studentCode,
          studentId: candidate.enrollment.studentId,
          oldEnrollmentId: candidate.enrollment.enrollmentId,
          oldAcademicYear: candidate.enrollment.academicYearName,
          oldClass: candidate.enrollment.className,
          oldSection: candidate.enrollment.sectionName,
          newAcademicYear: targetYear,
          newClass: targetClass,
          newSection: candidate.targetSection,
          newRollNumber: candidate.targetRollNumber,
          prospectiveEnrollmentId: `ENR-${yearPrefix}-${String(100 + index + 1).padStart(6, '0')}`,
          status: 'PROMOTED' as const,
        };
      })
      .filter(Boolean) as Array<any>;
  }, [selectedIds, candidates, targetYear, targetClass]);

  // Execute Promotions
  const handleConfirmPromotion = async () => {
    setIsProcessing(true);
    try {
      const payload = previewItems.map((item) => ({
        studentId: item.studentId,
        studentCode: item.studentCode,
        studentName: item.studentName,
        oldEnrollmentId: item.oldEnrollmentId,
        targetAcademicYear: targetYear,
        targetClass: targetClass,
        targetSection: item.newSection,
        targetRollNumber: item.newRollNumber,
      }));

      const res = await promoteStudentsMutation(payload).unwrap();
      const results = res?.data || res;
      setPromotionResults(results);
      setShowPreview(false);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Error processing promotions'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Top Header Card */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
              >
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                    Annual Student Promotions
                  </h5>
                  <Badge bg="success" className="fw-normal">
                    Cohort Rollover
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Rollover student cohorts into the subsequent academic year. Old enrollments are
                  preserved as historical records.
                </p>
              </div>
            </div>

            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1.5"
                onClick={() => navigate('/admissions')}
              >
                <ArrowLeft size={14} />
                <span>Back to Admissions</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Success Notification */}
      {promotionResults ? (
        <Alert variant="success" className="p-3 mb-4">
          <div className="d-flex align-items-start gap-2">
            <CheckCircle2 size={20} className="text-success mt-0.5 flex-shrink-0" />
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1">
                Successfully Promoted {promotionResults.length} Student
                {promotionResults.length > 1 ? 's' : ''}!
              </h6>
              <p className="small mb-2">
                New enrollment records have been established for academic year{' '}
                <strong>{targetYear}</strong> in <strong>{targetClass}</strong> with status{' '}
                <strong className="text-success">PROMOTED</strong>.
              </p>

              <div className="d-flex gap-2 mt-3">
                <Button variant="success" size="sm" onClick={() => navigate('/admissions')}>
                  View All Enrollments
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    setPromotionResults(null);
                    setHasLoaded(false);
                    setCandidates([]);
                    setSelectedIds([]);
                  }}
                >
                  Promote Another Batch
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      ) : (
        <>
          {/* Step 1: Criteria Form */}
          <PromotionCriteriaForm
            sourceYear={sourceYear}
            targetYear={targetYear}
            sourceClass={sourceClass}
            targetClass={targetClass}
            selectedSections={selectedSections}
            availableYears={availableYears}
            availableClasses={availableClasses}
            availableSections={availableSections}
            onSourceYearChange={(y) => setSourceYear(y)}
            onTargetYearChange={(y) => setTargetYear(y)}
            onSourceClassChange={(c) => setSourceClass(c)}
            onTargetClassChange={(c) => setTargetClass(c)}
            onToggleSection={handleToggleSection}
            onSelectAllSections={handleSelectAllSections}
            onLoadRoster={handleLoadRoster}
            isLoading={isLoadingRoster}
          />

          {/* Step 2: Student Roster Table (Shows after loading) */}
          {hasLoaded && (
            <PromotionRosterTable
              candidates={candidates}
              selectedIds={selectedIds}
              targetClass={targetClass}
              targetYear={targetYear}
              availableSections={availableSections}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              onUpdateTargetSection={handleUpdateTargetSection}
              onUpdateTargetRollNumber={handleUpdateTargetRollNumber}
              onSetGlobalTargetSection={handleSetGlobalTargetSection}
              onOpenPreview={() => setShowPreview(true)}
            />
          )}

          {/* Mandatory Preview Modal Before Save */}
          <PromotionPreviewModal
            show={showPreview}
            items={previewItems}
            onHide={() => setShowPreview(false)}
            onConfirm={handleConfirmPromotion}
            isProcessing={isProcessing}
          />
        </>
      )}
    </div>
  );
};
