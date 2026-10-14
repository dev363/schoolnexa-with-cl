import { DayOfWeek, TimetableEntry } from '@/types';

export interface TimetableSetupConfig {
  academicYearId: string;
  workingDays: DayOfWeek[];
  periodsPerDay: number;
  schoolStartTime: string;
  periodDurationMinutes: number;
  breakAfterPeriod: number;
  breakDurationMinutes: number;
  smartTimetable: boolean;
  advancedSettings: {
    maxPeriodsPerTeacherPerDay: number;
    maxSameSubjectPerDay: number;
    allowConsecutive: boolean;
    coreSubjectsMorning: boolean;
    activitiesAfternoon: boolean;
    teacherAvailability?: Record<
      string,
      { unavailableSlots: { day: DayOfWeek; periodNumber: number }[] }
    >;
    roomConstraints?: Record<string, string>; // subjectId -> preferred room
  };
}

export interface LessonRequirement {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  room: string;
  periodsPerWeek: number;
  maxPeriodsPerDay: number;
  allowConsecutive: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  isCore: boolean;
  isActivity: boolean;
  isFixed?: boolean;
  fixedDay?: DayOfWeek;
  fixedPeriod?: number;
}

export interface LessonInstance {
  id: string;
  requirementId: string;
  instanceIndex: number;
  schoolId: string;
  academicYearId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  room: string;
  maxPeriodsPerDay: number;
  allowConsecutive: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  isCore: boolean;
  isActivity: boolean;
  isFixed?: boolean;
  fixedDay?: DayOfWeek;
  fixedPeriod?: number;
  assignedDay?: DayOfWeek;
  assignedPeriod?: number;
}

export interface GridSlot {
  day: DayOfWeek;
  periodNumber: number;
  periodId: string;
  startTime: string;
  endTime: string;
}

export interface HumanProblemMessage {
  id: string;
  type: 'HARD_CLASH' | 'UNSCHEDULED' | 'WORKLOAD_WARNING' | 'CONSECUTIVE_WARNING';
  title: string;
  description: string;
  affectedClass?: string;
  affectedTeacher?: string;
  affectedSubject?: string;
  suggestedActions: string[];
}

export interface TimetableQualityReport {
  status: 'NO_CONFLICTS' | 'NEEDS_REVIEW' | 'PROBLEMS_FOUND';
  hardConflicts: number;
  softWarnings: number;
  unscheduledPeriods: number;
  teacherClashes: number;
  classClashes: number;
  roomClashes: number;
  messages: HumanProblemMessage[];
  score: number; // 0 to 100
}

export interface GeneratedTimetableDraft {
  id: string;
  schoolId: string;
  academicYearId: string;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  config: TimetableSetupConfig;
  entries: TimetableEntry[];
  quality: TimetableQualityReport;
  generationDurationMs: number;
}

export interface GenerationHistoryItem {
  id: string;
  schoolId: string;
  academicYearId: string;
  createdAt: string;
  generatedBy: string;
  status: 'VALID' | 'WARNINGS' | 'INVALID';
  classesCount: number;
  sectionsCount: number;
  teachersCount: number;
  subjectsCount: number;
  conflictsCount: number;
  warningsCount: number;
  durationMs: number;
  algorithmVersion: string;
  isPublished: boolean;
  entriesCount: number;
}

export type RegenerateScope =
  'FIX_CONFLICTS_ONLY' | 'ENTIRE_TIMETABLE' | 'THIS_CLASS' | 'THIS_TEACHER' | 'SELECTED_DAY';
