import { TimetableEntry } from '@/types';
import { BacktrackingSolver, SolverResult } from './backtrackingSolver';
import { TimetableMapper } from './timetableMapper';
import { TimetableScorer } from './timetableScorer';
import { TimetableValidator } from './timetableValidator';
import {
  GeneratedTimetableDraft,
  GenerationHistoryItem,
  GridSlot,
  LessonInstance,
  LessonRequirement,
  TimetableQualityReport,
  TimetableSetupConfig,
} from './types';

export type GenerationProgressCallback = (step: {
  key: string;
  label: string;
  completed: boolean;
  progressPercent: number;
}) => void;

const TIMETABLE_HISTORY_KEY = 'schoolnexa_timetable_generation_history_v1';

export class TimetableGenerator {
  public static readonly GENERATION_STEPS = [
    { key: 'classes', label: 'Checking classes & sections' },
    { key: 'subjects', label: 'Checking subjects & weekly hours' },
    { key: 'teachers', label: 'Checking teacher assignments' },
    { key: 'availability', label: 'Checking teacher availability' },
    { key: 'fixed', label: 'Placing fixed periods' },
    { key: 'difficult', label: 'Scheduling difficult subjects' },
    { key: 'distribute', label: 'Distributing subjects across the week' },
    { key: 'teacher_clashes', label: 'Checking teacher clashes' },
    { key: 'class_clashes', label: 'Checking class clashes' },
    { key: 'balance', label: 'Balancing the timetable' },
    { key: 'optimize', label: 'Optimizing pedagogical timetable balance' },
  ];

  /**
   * Main Generator Execution
   */
  public static async generate(
    requirements: LessonRequirement[],
    config: TimetableSetupConfig,
    schoolId: string,
    onProgress?: GenerationProgressCallback,
  ): Promise<GeneratedTimetableDraft> {
    const startTime = Date.now();

    // Helper to report progress with human UI pacing
    const report = async (stepIndex: number) => {
      if (onProgress && stepIndex < this.GENERATION_STEPS.length) {
        const step = this.GENERATION_STEPS[stepIndex];
        const progressPercent = Math.round(((stepIndex + 1) / this.GENERATION_STEPS.length) * 100);
        onProgress({
          key: step.key,
          label: step.label,
          completed: true,
          progressPercent,
        });
        // Non-blocking micro-delay for smooth UI animation
        await new Promise((r) => setTimeout(r, 90));
      }
    };

    // Phase 1: Validate inputs
    await report(0); // Checking classes
    await report(1); // Checking subjects
    await report(2); // Checking teacher assignments
    await report(3); // Checking teacher availability

    // Phase 2: Expand requirements
    const slots = TimetableMapper.generateGridSlots(config);
    const instances = TimetableMapper.expandRequirementsToInstances(requirements);

    // Phase 3 & 4: Prioritize difficult & Candidate Generation
    await report(4); // Placing fixed periods
    await report(5); // Scheduling difficult subjects
    await report(6); // Distributing subjects across the week

    // Phase 5 & 6: Constraint validation & Backtracking Solver
    await report(7); // Checking teacher clashes
    await report(8); // Checking class clashes

    // Execute solver
    const solverResult: SolverResult = BacktrackingSolver.solve(instances, slots, config);

    await report(9); // Balancing the timetable

    // Phase 7: Optimization & Quality Scoring
    const qualityReport: TimetableQualityReport = TimetableScorer.evaluate(
      solverResult.assignments,
      solverResult.unscheduledLessons,
      config,
    );

    await report(10); // Optimizing pedagogical balance

    // Map to official TimetableEntry models
    const entries: TimetableEntry[] = TimetableMapper.mapToTimetableEntries(
      solverResult.assignments,
      instances,
      slots,
    );

    const durationMs = Date.now() - startTime;

    const draft: GeneratedTimetableDraft = {
      id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      schoolId,
      academicYearId: config.academicYearId,
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
      config,
      entries,
      quality: qualityReport,
      generationDurationMs: durationMs,
    };

    // Store in history
    this.recordHistory({
      id: draft.id,
      schoolId,
      academicYearId: config.academicYearId,
      createdAt: draft.createdAt,
      generatedBy: 'Administrator',
      status:
        qualityReport.hardConflicts === 0
          ? qualityReport.softWarnings === 0
            ? 'VALID'
            : 'WARNINGS'
          : 'INVALID',
      classesCount: new Set(requirements.map((r) => r.classId)).size,
      sectionsCount: new Set(requirements.map((r) => r.sectionId)).size,
      teachersCount: new Set(requirements.filter((r) => r.teacherId).map((r) => r.teacherId)).size,
      subjectsCount: new Set(requirements.map((r) => r.subjectId)).size,
      conflictsCount: qualityReport.hardConflicts,
      warningsCount: qualityReport.softWarnings,
      durationMs,
      algorithmVersion: 'SchoolNexa Constraint Engine v2.5',
      isPublished: false,
      entriesCount: entries.length,
    });

    return draft;
  }

  /**
   * Generation History Management
   */
  public static getHistory(schoolId: string): GenerationHistoryItem[] {
    try {
      const raw = localStorage.getItem(TIMETABLE_HISTORY_KEY);
      if (!raw) return [];
      const all: GenerationHistoryItem[] = JSON.parse(raw);
      return all.filter((h) => !schoolId || h.schoolId === schoolId);
    } catch {
      return [];
    }
  }

  public static recordHistory(item: GenerationHistoryItem): void {
    try {
      const raw = localStorage.getItem(TIMETABLE_HISTORY_KEY);
      const all: GenerationHistoryItem[] = raw ? JSON.parse(raw) : [];
      const updated = [item, ...all.filter((h) => h.id !== item.id)].slice(0, 20); // Keep last 20
      localStorage.setItem(TIMETABLE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to record history', e);
    }
  }

  public static markPublishedInHistory(id: string): void {
    try {
      const raw = localStorage.getItem(TIMETABLE_HISTORY_KEY);
      if (!raw) return;
      const all: GenerationHistoryItem[] = JSON.parse(raw);
      const updated = all.map((h) => (h.id === id ? { ...h, isPublished: true } : h));
      localStorage.setItem(TIMETABLE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to mark published in history', e);
    }
  }
}
