import { DayOfWeek, TimetableEntry } from '@/types';
import { ConstraintEngine, AssignedSlot } from './constraintEngine';
import { GridSlot, LessonRequirement, TimetableSetupConfig } from './types';

export interface ValidationCheckResult {
  readyToGenerate: boolean;
  totalClasses: number;
  totalSections: number;
  totalTeachers: number;
  totalSubjects: number;
  totalWeeklyCapacityPerSection: number;
  totalWeeklySlotsAllSections: number;
  checklist: {
    classesConfigured: boolean;
    subjectsAssigned: boolean;
    teachersAssigned: boolean;
    weeklyPeriodsConfigured: boolean;
    workloadBalanced: boolean;
  };
  warnings: string[];
  errors: string[];
}

export class TimetableValidator {
  /**
   * Validates setup and requirements before launching generation.
   */
  public static validatePreGeneration(
    requirements: LessonRequirement[],
    config: TimetableSetupConfig,
  ): ValidationCheckResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    const sectionIds = new Set(requirements.map((r) => r.sectionId));
    const classIds = new Set(requirements.map((r) => r.classId));
    const teacherIds = new Set(requirements.filter((r) => r.teacherId).map((r) => r.teacherId));
    const subjectIds = new Set(requirements.map((r) => r.subjectId));

    const totalWeeklyCapacityPerSection = config.workingDays.length * config.periodsPerDay;
    const totalWeeklySlotsAllSections = totalWeeklyCapacityPerSection * sectionIds.size;

    if (config.workingDays.length === 0) {
      errors.push('Please select at least one working day.');
    }
    if (config.periodsPerDay <= 0 || config.periodsPerDay > 12) {
      errors.push('Periods per day must be between 1 and 12.');
    }
    if (requirements.length === 0) {
      errors.push(
        'No subject requirements found. Click "⚡ Auto Setup" to populate school requirements.',
      );
    }

    // Check teacher assignments
    const unassignedTeachers = requirements.filter(
      (r) => !r.teacherId || r.teacherId.trim() === '',
    );
    if (unassignedTeachers.length > 0) {
      const sample = unassignedTeachers
        .slice(0, 3)
        .map((r) => `${r.className} (${r.sectionName}) - ${r.subjectName}`)
        .join(', ');
      warnings.push(`Some subjects have no teacher assigned (e.g. ${sample}).`);
    }

    // Check capacity per section
    sectionIds.forEach((secId) => {
      const secReqs = requirements.filter((r) => r.sectionId === secId);
      const totalPeriods = secReqs.reduce((sum, r) => sum + r.periodsPerWeek, 0);
      const sample = secReqs[0];
      const sectionName = sample ? `${sample.className}-${sample.sectionName}` : secId;

      if (totalPeriods > totalWeeklyCapacityPerSection) {
        warnings.push(
          `${sectionName} has ${totalPeriods} requested periods, which exceeds the weekly limit of ${totalWeeklyCapacityPerSection}. Extra periods will not fit.`,
        );
      } else if (totalPeriods < totalWeeklyCapacityPerSection) {
        const diff = totalWeeklyCapacityPerSection - totalPeriods;
        // Minor note
        // warnings.push(`${sectionName} has ${diff} free/unscheduled periods in the week.`);
      }
    });

    // Check teacher workload against available slots
    const teacherTotalPeriods: Record<string, { name: string; count: number }> = {};
    requirements.forEach((r) => {
      if (r.teacherId) {
        if (!teacherTotalPeriods[r.teacherId]) {
          teacherTotalPeriods[r.teacherId] = { name: r.teacherName, count: 0 };
        }
        teacherTotalPeriods[r.teacherId].count += r.periodsPerWeek;
      }
    });

    Object.values(teacherTotalPeriods).forEach((t) => {
      if (t.count > totalWeeklyCapacityPerSection) {
        warnings.push(
          `Teacher ${t.name} is assigned ${t.count} periods/week, exceeding the maximum available ${totalWeeklyCapacityPerSection} periods. Please distribute workload.`,
        );
      }
    });

    const classesConfigured = classIds.size > 0;
    const subjectsAssigned = subjectIds.size > 0;
    const teachersAssigned =
      unassignedTeachers.length === 0 || unassignedTeachers.length < requirements.length / 2;
    const weeklyPeriodsConfigured = requirements.some((r) => r.periodsPerWeek > 0);
    const workloadBalanced = !warnings.some((w) => w.includes('exceeding the maximum available'));

    const readyToGenerate = errors.length === 0 && classesConfigured && subjectsAssigned;

    return {
      readyToGenerate,
      totalClasses: classIds.size,
      totalSections: sectionIds.size,
      totalTeachers: teacherIds.size,
      totalSubjects: subjectIds.size,
      totalWeeklyCapacityPerSection,
      totalWeeklySlotsAllSections,
      checklist: {
        classesConfigured,
        subjectsAssigned,
        teachersAssigned,
        weeklyPeriodsConfigured,
        workloadBalanced,
      },
      warnings,
      errors,
    };
  }

  /**
   * Validates moving or swapping an entry in the draft timetable grid.
   * Returns human-friendly message if invalid.
   */
  public static validateManualMove(
    entryToMove: TimetableEntry,
    targetDay: DayOfWeek,
    targetPeriodNumber: number,
    targetPeriodId: string,
    allEntries: TimetableEntry[],
    config: TimetableSetupConfig,
  ): {
    valid: boolean;
    humanMessage: string;
    targetExistingEntry?: TimetableEntry;
  } {
    // Check if target is same as source
    const currentPeriodNum = parseInt(entryToMove.periodId.replace(/\D/g, ''), 10) || 1;
    if (entryToMove.dayOfWeek === targetDay && currentPeriodNum === targetPeriodNumber) {
      return { valid: true, humanMessage: 'No change made.' };
    }

    // Working day check
    if (!config.workingDays.includes(targetDay)) {
      return {
        valid: false,
        humanMessage: `${targetDay} is not an active school day.`,
      };
    }
    if (targetPeriodNumber > config.periodsPerDay) {
      return {
        valid: false,
        humanMessage: `Period ${targetPeriodNumber} is outside school schedule hours.`,
      };
    }

    // Find any existing entry at target slot in this section
    const targetExisting = allEntries.find(
      (e) =>
        e.academicYearSectionId === entryToMove.academicYearSectionId &&
        e.dayOfWeek === targetDay &&
        (e.periodId === targetPeriodId ||
          (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === targetPeriodNumber),
    );

    // If teacher is moving, check if teacher is teaching another section in target slot
    if (entryToMove.teacherId) {
      const teacherClash = allEntries.find(
        (e) =>
          e.id !== entryToMove.id &&
          e.id !== targetExisting?.id &&
          e.teacherId === entryToMove.teacherId &&
          e.dayOfWeek === targetDay &&
          (e.periodId === targetPeriodId ||
            (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === targetPeriodNumber),
      );

      if (teacherClash) {
        return {
          valid: false,
          humanMessage: `Cannot move: Teacher ${entryToMove.teacherName || 'Faculty'} is already teaching ${teacherClash.className}-${teacherClash.sectionName} on ${targetDay} Period ${targetPeriodNumber}.`,
        };
      }

      // Check teacher availability
      const teacherAvail = config.advancedSettings?.teacherAvailability?.[entryToMove.teacherId];
      if (teacherAvail?.unavailableSlots) {
        const isUnavail = teacherAvail.unavailableSlots.some(
          (u) => u.day === targetDay && u.periodNumber === targetPeriodNumber,
        );
        if (isUnavail) {
          return {
            valid: false,
            humanMessage: `Cannot move: Teacher ${entryToMove.teacherName} is marked unavailable on ${targetDay} Period ${targetPeriodNumber}.`,
          };
        }
      }
    }

    // Check if target is a swap with targetExisting: if swapping, check if targetExisting's teacher clashes in source slot!
    if (targetExisting && targetExisting.teacherId) {
      const sourcePeriodNum = currentPeriodNum;
      const swapTeacherClash = allEntries.find(
        (e) =>
          e.id !== entryToMove.id &&
          e.id !== targetExisting.id &&
          e.teacherId === targetExisting.teacherId &&
          e.dayOfWeek === entryToMove.dayOfWeek &&
          (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === sourcePeriodNum,
      );
      if (swapTeacherClash) {
        return {
          valid: false,
          humanMessage: `Cannot swap: Swapped teacher ${targetExisting.teacherName} is already teaching ${swapTeacherClash.className}-${swapTeacherClash.sectionName} on ${entryToMove.dayOfWeek} Period ${sourcePeriodNum}.`,
        };
      }
    }

    return {
      valid: true,
      humanMessage: targetExisting ? `Swapping with ${targetExisting.subjectName}` : 'Move allowed',
      targetExistingEntry: targetExisting,
    };
  }
}
