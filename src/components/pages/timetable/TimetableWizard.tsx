import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Settings,
  Users,
  Play,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  History,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Badge } from 'react-bootstrap';
import {
  AcademicYearSectionItem,
  ClassItem,
  DayOfWeek,
  StaffMember,
  SubjectItem,
  TimetableEntry,
} from '@/types';
import { academicService } from '@/services/academicService';
import {
  GeneratedTimetableDraft,
  GenerationHistoryItem,
  GridSlot,
  LessonRequirement,
  RegenerateScope,
  TimetableQualityReport,
  TimetableSetupConfig,
} from '@/services/timetable/types';
import { AutoSetupService } from '@/services/timetable/autoSetupService';
import { TimetableValidator, ValidationCheckResult } from '@/services/timetable/timetableValidator';
import {
  TimetableGenerator,
  GenerationProgressCallback,
} from '@/services/timetable/timetableGenerator';
import { TimetableRepair } from '@/services/timetable/timetableRepair';
import { TimetableMapper } from '@/services/timetable/timetableMapper';
import { TimetableScorer } from '@/services/timetable/timetableScorer';

import { TimetableSetup } from './TimetableSetup';
import { TimetableAssignment } from './TimetableAssignment';
import { TimetableGenerate } from './TimetableGenerate';
import { TimetableGenerationProgress } from './TimetableGenerationProgress';
import { TimetablePreview } from './TimetablePreview';
import { SavePublishModal } from './SavePublishModal';
import { GenerationHistoryModal } from './GenerationHistoryModal';

export type WizardStep = 'SETUP' | 'ASSIGN' | 'GENERATE' | 'PREVIEW';

interface TimetableWizardProps {
  schoolId: string;
  onPublished?: () => void;
  onCancel?: () => void;
}

export const TimetableWizard: React.FC<TimetableWizardProps> = ({
  schoolId,
  onPublished,
  onCancel,
}) => {
  // Academic metadata
  const [academicYears, setAcademicYears] = useState(() =>
    academicService.getAcademicYears(schoolId),
  );
  const activeYear = useMemo(
    () => academicYears.find((y) => y.isCurrent) || academicYears[0],
    [academicYears],
  );

  const [classes, setClasses] = useState<ClassItem[]>(() =>
    academicService.getClassesSync(schoolId),
  );
  const [sections, setSections] = useState<AcademicYearSectionItem[]>(() =>
    academicService.getSectionsSync(schoolId, activeYear?.id),
  );
  const [subjects, setSubjects] = useState<SubjectItem[]>(() =>
    academicService.getSubjectsSync(schoolId),
  );
  const [staff, setStaff] = useState<StaffMember[]>(() => academicService.getStaff(schoolId));

  // Current Step
  const [currentStep, setCurrentStep] = useState<WizardStep>('SETUP');

  // Step 1: Config
  const [config, setConfig] = useState<TimetableSetupConfig>(() => ({
    schoolId,
    academicYearId: activeYear?.id || 'ay-2026',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    periodsPerDay: 6,
    schoolStartTime: '08:30',
    periodDurationMinutes: 40,
    breakAfterPeriod: 3,
    breakDurationMinutes: 20,
    smartTimetable: true,
    advancedSettings: {
      maxPeriodsPerTeacherPerDay: 5,
      maxSameSubjectPerDay: 2,
      allowConsecutive: false,
      coreSubjectsMorning: true,
      activitiesAfternoon: true,
      teacherAvailability: {},
      roomConstraints: {},
    },
  }));

  // Step 2: Requirements
  const [requirements, setRequirements] = useState<LessonRequirement[]>(() => {
    // Initial auto-population from school data
    return AutoSetupService.buildRequirementsFromSchoolData(schoolId, activeYear?.id, config);
  });

  // Step 3 & 4: Generation State & Draft
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState<{
    completedStepKeys: string[];
    currentStepKey: string;
    progressPercent: number;
    isFinished: boolean;
  }>({
    completedStepKeys: [],
    currentStepKey: '',
    progressPercent: 0,
    isFinished: false,
  });

  const [draft, setDraft] = useState<GeneratedTimetableDraft | null>(null);
  const [autoFixMessage, setAutoFixMessage] = useState<string | null>(null);

  // Modals
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState<GenerationHistoryItem[]>(() =>
    TimetableGenerator.getHistory(schoolId),
  );

  // Validation
  const validation: ValidationCheckResult = useMemo(() => {
    return TimetableValidator.validatePreGeneration(requirements, config);
  }, [requirements, config]);

  // Derived Grid Slots
  const gridSlots: GridSlot[] = useMemo(() => {
    return TimetableMapper.generateGridSlots(config);
  }, [config]);

  // Handle Auto Setup Click
  const handleAutoSetup = () => {
    const autoReqs = AutoSetupService.buildRequirementsFromSchoolData(
      schoolId,
      config.academicYearId,
      config,
    );
    if (autoReqs.length === 0) {
      // If school has no classes/sections yet, load benchmark to demonstrate functionality immediately
      handleSeedBenchmark();
    } else {
      setRequirements(autoReqs);
    }
  };

  // Handle Benchmark Data Seeding (Section 29: Acceptance Test)
  const handleSeedBenchmark = () => {
    const benchmark = AutoSetupService.seedAcceptanceBenchmark(schoolId, config.academicYearId);
    setClasses(benchmark.classes);
    setSections(benchmark.sections);
    setSubjects(benchmark.subjects);
    setStaff(benchmark.staff);
    setRequirements(benchmark.requirements);
  };

  // Copy to Sister Sections
  const handleApplyToSections = (sourceSectionId: string, targetSectionIds: string[]) => {
    const updated = AutoSetupService.applyToSections(
      sourceSectionId,
      targetSectionIds,
      requirements,
    );
    setRequirements(updated);
  };

  // Copy Previous Year
  const handleCopyPreviousYear = () => {
    // Duplicates requirements with fresh IDs
    const cloned = requirements.map((r) => ({
      ...r,
      id: `req-${r.sectionId}-${r.subjectId}-${Date.now()}`,
    }));
    setRequirements(cloned);
  };

  // Execute Generation
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setProgressState({
      completedStepKeys: [],
      currentStepKey: TimetableGenerator.GENERATION_STEPS[0].key,
      progressPercent: 10,
      isFinished: false,
    });

    try {
      const generatedDraft = await TimetableGenerator.generate(
        requirements,
        config,
        schoolId,
        (step) => {
          setProgressState((prev) => ({
            completedStepKeys: [...prev.completedStepKeys, step.key],
            currentStepKey: step.key,
            progressPercent: step.progressPercent,
            isFinished: step.progressPercent === 100,
          }));
        },
      );

      setProgressState((prev) => ({ ...prev, isFinished: true, progressPercent: 100 }));

      // Wait a moment for celebration animation
      setTimeout(() => {
        setDraft(generatedDraft);
        setIsGenerating(false);
        setCurrentStep('PREVIEW');
        setHistoryList(TimetableGenerator.getHistory(schoolId));
      }, 700);
    } catch (e) {
      console.error('Generation error', e);
      setIsGenerating(false);
    }
  };

  // Manual Move or Swap in Preview
  const handleMoveEntry = (
    sourceEntry: TimetableEntry,
    targetDay: DayOfWeek,
    targetPeriodNumber: number,
  ) => {
    if (!draft) return;

    const currentEntries = [...draft.entries];
    const targetPeriodId = `p${targetPeriodNumber}`;
    const targetSlot = gridSlots.find(
      (s) => s.day === targetDay && s.periodNumber === targetPeriodNumber,
    );

    // Check if target already has an entry for this section
    const targetExisting = currentEntries.find(
      (e) =>
        e.academicYearSectionId === sourceEntry.academicYearSectionId &&
        e.dayOfWeek === targetDay &&
        (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === targetPeriodNumber,
    );

    let updatedEntries: TimetableEntry[];

    if (targetExisting) {
      // SWAP
      const sourcePeriodNumber = parseInt(sourceEntry.periodId.replace(/\D/g, ''), 10) || 1;
      const sourceSlot = gridSlots.find(
        (s) => s.day === sourceEntry.dayOfWeek && s.periodNumber === sourcePeriodNumber,
      );

      updatedEntries = currentEntries.map((e) => {
        if (e.id === sourceEntry.id) {
          return {
            ...e,
            dayOfWeek: targetDay,
            periodId: targetPeriodId,
            startTime: targetSlot?.startTime || e.startTime,
            endTime: targetSlot?.endTime || e.endTime,
          };
        }
        if (e.id === targetExisting.id) {
          return {
            ...e,
            dayOfWeek: sourceEntry.dayOfWeek,
            periodId: sourceEntry.periodId,
            startTime: sourceSlot?.startTime || e.startTime,
            endTime: sourceSlot?.endTime || e.endTime,
          };
        }
        return e;
      });
    } else {
      // SIMPLE MOVE
      updatedEntries = currentEntries.map((e) => {
        if (e.id === sourceEntry.id) {
          return {
            ...e,
            dayOfWeek: targetDay,
            periodId: targetPeriodId,
            startTime: targetSlot?.startTime || e.startTime,
            endTime: targetSlot?.endTime || e.endTime,
          };
        }
        return e;
      });
    }

    // Recalculate quality
    const instances = TimetableMapper.expandRequirementsToInstances(requirements);
    const assignedSlots = updatedEntries.map((e) => ({
      instanceId: e.id,
      sectionId: e.academicYearSectionId,
      teacherId: e.teacherId,
      subjectId: e.subjectId,
      subjectName: e.subjectName || '',
      room: e.room,
      day: e.dayOfWeek,
      periodNumber: parseInt(e.periodId.replace(/\D/g, ''), 10) || 1,
      isCore: true,
      isActivity: false,
      allowConsecutive: false,
    }));

    const quality = TimetableScorer.evaluate(assignedSlots, [], config);

    setDraft({
      ...draft,
      entries: updatedEntries,
      quality,
    });
  };

  // Auto Fix
  const handleAutoFix = () => {
    if (!draft) return;
    const fixResult = TimetableRepair.autoFix(draft.entries, gridSlots, config);

    // Recalculate quality
    const assignedSlots = fixResult.fixedEntries.map((e) => ({
      instanceId: e.id,
      sectionId: e.academicYearSectionId,
      teacherId: e.teacherId,
      subjectId: e.subjectId,
      subjectName: e.subjectName || '',
      room: e.room,
      day: e.dayOfWeek,
      periodNumber: parseInt(e.periodId.replace(/\D/g, ''), 10) || 1,
      isCore: true,
      isActivity: false,
      allowConsecutive: false,
    }));

    const quality = TimetableScorer.evaluate(assignedSlots, [], config);

    setDraft({
      ...draft,
      entries: fixResult.fixedEntries,
      quality,
    });

    setAutoFixMessage(fixResult.summaryMessage);
    setTimeout(() => setAutoFixMessage(null), 5000);
  };

  // Scoped Regeneration
  const handleRegenerate = (scope: RegenerateScope, filterId: string) => {
    if (!draft) return;

    if (scope === 'ENTIRE_TIMETABLE') {
      handleStartGeneration();
      return;
    }

    const instances = TimetableMapper.expandRequirementsToInstances(requirements);
    const updatedEntries = TimetableRepair.regenerateScoped(
      scope,
      filterId,
      draft.entries,
      instances,
      gridSlots,
      config,
    );

    const assignedSlots = updatedEntries.map((e) => ({
      instanceId: e.id,
      sectionId: e.academicYearSectionId,
      teacherId: e.teacherId,
      subjectId: e.subjectId,
      subjectName: e.subjectName || '',
      room: e.room,
      day: e.dayOfWeek,
      periodNumber: parseInt(e.periodId.replace(/\D/g, ''), 10) || 1,
      isCore: true,
      isActivity: false,
      allowConsecutive: false,
    }));

    const quality = TimetableScorer.evaluate(assignedSlots, [], config);

    setDraft({
      ...draft,
      entries: updatedEntries,
      quality,
    });

    setAutoFixMessage(`Regenerated with scope: ${scope}`);
    setTimeout(() => setAutoFixMessage(null), 4000);
  };

  // Save as Draft
  const handleSaveDraft = () => {
    if (!draft) return;
    academicService.saveTimetableEntries(draft.entries);
    setDraft({ ...draft, status: 'DRAFT' });
    setAutoFixMessage('Timetable draft saved successfully.');
    setTimeout(() => setAutoFixMessage(null), 4000);
  };

  // Publish
  const handlePublish = () => {
    if (!draft) return;
    academicService.saveTimetableEntries(draft.entries);
    TimetableGenerator.markPublishedInHistory(draft.id);
    setDraft({ ...draft, status: 'PUBLISHED' });
    setHistoryList(TimetableGenerator.getHistory(schoolId));
    if (onPublished) {
      onPublished();
    }
  };

  // Restore History Item
  const handleRestoreFromHistory = (item: GenerationHistoryItem) => {
    // If we have saved entries in academicService or can reconstruct
    const currentSchoolEntries = academicService.getTimetableEntries(schoolId, {
      academicYearId: item.academicYearId,
    });
    if (currentSchoolEntries.length > 0) {
      const assignedSlots = currentSchoolEntries.map((e) => ({
        instanceId: e.id,
        sectionId: e.academicYearSectionId,
        teacherId: e.teacherId,
        subjectId: e.subjectId,
        subjectName: e.subjectName || '',
        room: e.room,
        day: e.dayOfWeek,
        periodNumber: parseInt(e.periodId.replace(/\D/g, ''), 10) || 1,
        isCore: true,
        isActivity: false,
        allowConsecutive: false,
      }));
      const quality = TimetableScorer.evaluate(assignedSlots, [], config);

      setDraft({
        id: item.id,
        schoolId,
        academicYearId: item.academicYearId,
        createdAt: item.createdAt,
        status: item.isPublished ? 'PUBLISHED' : 'DRAFT',
        config,
        entries: currentSchoolEntries,
        quality,
        generationDurationMs: item.durationMs,
      });
      setCurrentStep('PREVIEW');
    }
  };

  const stepsList: { key: WizardStep; label: string; number: number }[] = [
    { key: 'SETUP', label: '1. Setup', number: 1 },
    { key: 'ASSIGN', label: '2. Assign', number: 2 },
    { key: 'GENERATE', label: '3. Generate', number: 3 },
    { key: 'PREVIEW', label: '4. Review & Edit', number: 4 },
  ];

  return (
    <div id="schoolnexa-timetable-wizard" className="d-flex flex-column gap-4">
      {/* Top Wizard Navigation Breadcrumb Bar */}
      <Card className="shadow-sm border">
        <Card.Body className="p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center p-2"
              style={{ width: '40px', height: '40px' }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="h6 fw-bold mb-0">Simple Timetable Generator</h1>
              <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                Automatic clash-free timetable scheduler for SchoolNexa ERP
              </p>
            </div>
          </div>

          {/* Stepper Pills */}
          <div className="d-flex align-items-center gap-1.5 overflow-x-auto pb-1 pb-md-0">
            {stepsList.map((s) => {
              const isActive = currentStep === s.key;
              const isCompleted =
                (s.key === 'SETUP' && currentStep !== 'SETUP') ||
                (s.key === 'ASSIGN' && (currentStep === 'GENERATE' || currentStep === 'PREVIEW')) ||
                (s.key === 'GENERATE' && currentStep === 'PREVIEW');

              return (
                <Button
                  key={s.key}
                  variant={isActive ? 'primary' : isCompleted ? 'outline-success' : 'light'}
                  size="sm"
                  disabled={!isCompleted && !isActive}
                  onClick={() => {
                    if (isCompleted || isActive) {
                      setCurrentStep(s.key);
                    }
                  }}
                  className="d-inline-flex align-items-center gap-1.5 text-nowrap py-1 px-2.5"
                  style={{ fontSize: '0.78rem' }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={13} className="text-success" />
                  ) : (
                    <span
                      className="rounded-circle bg-dark bg-opacity-10 d-inline-flex align-items-center justify-content-center font-monospace"
                      style={{ width: '16px', height: '16px', fontSize: '0.65rem' }}
                    >
                      {s.number}
                    </span>
                  )}
                  <span>{s.label}</span>
                </Button>
              );
            })}
          </div>

          {onCancel && (
            <Button
              variant="link"
              size="sm"
              onClick={onCancel}
              className="text-muted text-decoration-none align-self-end align-self-md-center small p-0"
              style={{ fontSize: '0.78rem' }}
            >
              Close Generator
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Main Step Views */}
      <div>
        {isGenerating ? (
          <TimetableGenerationProgress
            completedStepKeys={progressState.completedStepKeys}
            currentStepKey={progressState.currentStepKey}
            progressPercent={progressState.progressPercent}
            isFinished={progressState.isFinished}
          />
        ) : (
          <>
            {currentStep === 'SETUP' && (
              <TimetableSetup
                config={config}
                onChangeConfig={setConfig}
                academicYears={academicYears}
                onNext={() => setCurrentStep('ASSIGN')}
              />
            )}

            {currentStep === 'ASSIGN' && (
              <TimetableAssignment
                requirements={requirements}
                onChangeRequirements={setRequirements}
                config={config}
                classes={classes}
                sections={sections}
                subjects={subjects}
                staff={staff}
                onAutoSetup={handleAutoSetup}
                onSeedBenchmark={handleSeedBenchmark}
                onApplyToSections={handleApplyToSections}
                onCopyPreviousYear={handleCopyPreviousYear}
                onNext={() => setCurrentStep('GENERATE')}
                onBack={() => setCurrentStep('SETUP')}
              />
            )}

            {currentStep === 'GENERATE' && (
              <TimetableGenerate
                validation={validation}
                config={config}
                onStartGeneration={handleStartGeneration}
                onBack={() => setCurrentStep('ASSIGN')}
                isGenerating={isGenerating}
              />
            )}

            {currentStep === 'PREVIEW' && draft && (
              <TimetablePreview
                draft={draft}
                sections={sections}
                staff={staff}
                slots={gridSlots}
                onMoveEntry={handleMoveEntry}
                onAutoFix={handleAutoFix}
                onRegenerate={handleRegenerate}
                onOpenSaveModal={() => setIsSaveModalOpen(true)}
                onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
                onBackToRequirements={() => setCurrentStep('ASSIGN')}
                autoFixBannerMessage={autoFixMessage}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {draft && (
        <SavePublishModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          quality={draft.quality}
          totalClasses={new Set(draft.entries.map((e) => e.academicYearSectionId)).size}
          totalTeachers={
            new Set(draft.entries.filter((e) => e.teacherId).map((e) => e.teacherId)).size
          }
          totalEntries={draft.entries.length}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      )}

      <GenerationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={historyList}
        onRestore={handleRestoreFromHistory}
      />
    </div>
  );
};
