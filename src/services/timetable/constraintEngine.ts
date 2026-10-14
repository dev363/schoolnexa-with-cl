import { DayOfWeek } from '@/types';
import { GridSlot, LessonInstance, TimetableSetupConfig } from './types';

export interface AssignedSlot {
  instanceId: string;
  sectionId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  room: string;
  day: DayOfWeek;
  periodNumber: number;
  isCore: boolean;
  isActivity: boolean;
  allowConsecutive: boolean;
}

export class ConstraintEngine {
  /**
   * Checks if placing a lesson instance into a given slot violates ANY HARD CONSTRAINT.
   * Hard constraints:
   * 1. Section already has a class in this period.
   * 2. Teacher is already teaching another section in this period.
   * 3. Teacher is unavailable in this period.
   * 4. Room is already occupied in this period by another section.
   * 5. Slot is outside configured working days or periods.
   */
  public static canAssignHard(
    lesson: LessonInstance,
    slot: GridSlot,
    assignments: AssignedSlot[],
    config: TimetableSetupConfig,
  ): { valid: boolean; reason?: string } {
    // 0. Boundary check
    if (!config.workingDays.includes(slot.day)) {
      return {
        valid: false,
        reason: `${slot.day} is not an active working day.`,
      };
    }
    if (slot.periodNumber > config.periodsPerDay) {
      return {
        valid: false,
        reason: `Period ${slot.periodNumber} exceeds maximum periods (${config.periodsPerDay}).`,
      };
    }

    // 1. Section conflict: A class section cannot have two subjects in the same period
    const sectionOccupied = assignments.find(
      (a) =>
        a.sectionId === lesson.sectionId &&
        a.day === slot.day &&
        a.periodNumber === slot.periodNumber,
    );
    if (sectionOccupied && sectionOccupied.instanceId !== lesson.id) {
      return {
        valid: false,
        reason: `${lesson.className} (${lesson.sectionName}) already has ${sectionOccupied.subjectName} in ${slot.day} Period ${slot.periodNumber}.`,
      };
    }

    // 2. Teacher conflict: A teacher cannot teach two classes simultaneously in the same period
    if (lesson.teacherId) {
      const teacherOccupied = assignments.find(
        (a) =>
          a.teacherId === lesson.teacherId &&
          a.day === slot.day &&
          a.periodNumber === slot.periodNumber &&
          a.instanceId !== lesson.id,
      );
      if (teacherOccupied) {
        return {
          valid: false,
          reason: `Teacher ${lesson.teacherName} is already scheduled with another class in ${slot.day} Period ${slot.periodNumber}.`,
        };
      }

      // 3. Teacher availability constraint
      const teacherAvail = config.advancedSettings?.teacherAvailability?.[lesson.teacherId];
      if (teacherAvail?.unavailableSlots) {
        const isUnavailable = teacherAvail.unavailableSlots.some(
          (u) => u.day === slot.day && u.periodNumber === slot.periodNumber,
        );
        if (isUnavailable) {
          return {
            valid: false,
            reason: `Teacher ${lesson.teacherName} is marked unavailable on ${slot.day} Period ${slot.periodNumber}.`,
          };
        }
      }
    }

    // 4. Room conflict: Specialized rooms (e.g. Labs, Studio, Computer Lab) cannot be shared simultaneously
    if (
      lesson.room &&
      lesson.room.trim() !== '' &&
      !lesson.room.toLowerCase().includes('regular')
    ) {
      const normalizedRoom = lesson.room.trim().toLowerCase();
      const roomOccupied = assignments.find(
        (a) =>
          a.room &&
          a.room.trim().toLowerCase() === normalizedRoom &&
          a.day === slot.day &&
          a.periodNumber === slot.periodNumber &&
          a.sectionId !== lesson.sectionId &&
          a.instanceId !== lesson.id,
      );
      if (roomOccupied) {
        return {
          valid: false,
          reason: `Room ${lesson.room} is occupied by another class in ${slot.day} Period ${slot.periodNumber}.`,
        };
      }
    }

    // 5. Fixed period constraint
    if (lesson.isFixed && lesson.fixedDay && lesson.fixedPeriod) {
      if (slot.day !== lesson.fixedDay || slot.periodNumber !== lesson.fixedPeriod) {
        return {
          valid: false,
          reason: `Subject has fixed schedule requirement for ${lesson.fixedDay} Period ${lesson.fixedPeriod}.`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Calculates a soft constraint penalty score (lower penalty is better).
   * Evaluates:
   * - Daily subject repetition (avoid > maxPeriodsPerDay for same subject, usually max 1 or 2)
   * - Consecutive subject placement without allowance
   * - Teacher consecutive strain (avoid > 2 or 3 back-to-back periods)
   * - Core subjects in morning (early periods)
   * - Activity subjects in afternoon (late periods)
   * - Even subject distribution across days
   */
  public static calculateSoftPenalty(
    lesson: LessonInstance,
    slot: GridSlot,
    assignments: AssignedSlot[],
    config: TimetableSetupConfig,
  ): number {
    let penalty = 0;
    const isSmart = config.smartTimetable !== false;

    // Filter assignments for this section
    const sectionDayAssignments = assignments.filter(
      (a) => a.sectionId === lesson.sectionId && a.day === slot.day && a.instanceId !== lesson.id,
    );

    // 1. Same subject repetition on the same day
    const sameSubjectToday = sectionDayAssignments.filter(
      (a) => a.subjectId === lesson.subjectId,
    ).length;
    const maxAllowed =
      lesson.maxPeriodsPerDay || config.advancedSettings?.maxSameSubjectPerDay || 1;
    if (sameSubjectToday >= maxAllowed) {
      penalty += 40 * (sameSubjectToday - maxAllowed + 1);
    } else if (sameSubjectToday === 1 && !lesson.allowConsecutive) {
      penalty += 15;
    }

    // 2. Consecutive period check for same subject
    if (!lesson.allowConsecutive) {
      const prevPeriod = sectionDayAssignments.find(
        (a) => a.periodNumber === slot.periodNumber - 1,
      );
      const nextPeriod = sectionDayAssignments.find(
        (a) => a.periodNumber === slot.periodNumber + 1,
      );
      if (
        prevPeriod?.subjectId === lesson.subjectId ||
        nextPeriod?.subjectId === lesson.subjectId
      ) {
        penalty += 35;
      }
    }

    // 3. Teacher strain check: teacher consecutive periods across all sections
    if (lesson.teacherId) {
      const teacherDayAssignments = assignments.filter(
        (a) => a.teacherId === lesson.teacherId && a.day === slot.day && a.instanceId !== lesson.id,
      );

      // Teacher daily maximum periods
      const teacherDailyMax = config.advancedSettings?.maxPeriodsPerTeacherPerDay || 5;
      if (teacherDayAssignments.length >= teacherDailyMax) {
        penalty += 30 * (teacherDayAssignments.length - teacherDailyMax + 1);
      }

      // Check consecutive teaching periods for teacher
      let consecutiveCount = 0;
      for (let p = slot.periodNumber - 1; p >= 1; p--) {
        if (teacherDayAssignments.some((a) => a.periodNumber === p)) consecutiveCount++;
        else break;
      }
      for (let p = slot.periodNumber + 1; p <= config.periodsPerDay; p++) {
        if (teacherDayAssignments.some((a) => a.periodNumber === p)) consecutiveCount++;
        else break;
      }
      if (consecutiveCount >= 3) {
        penalty += 25;
      } else if (consecutiveCount === 2) {
        penalty += 10;
      }
    }

    // 4. Smart Pedagogy Optimization:
    // Core subjects (Math, English, Science) best placed in periods 1 to 3
    // Activity subjects (PE, Art, Music, Library) best placed in periods 4 to 6
    if (isSmart) {
      if (lesson.isCore && config.advancedSettings?.coreSubjectsMorning !== false) {
        if (slot.periodNumber > 3) {
          // Penalty increases the later in the day it is
          penalty += (slot.periodNumber - 3) * 6;
        }
      }

      if (lesson.isActivity && config.advancedSettings?.activitiesAfternoon !== false) {
        if (slot.periodNumber <= 2) {
          penalty += (3 - slot.periodNumber) * 8;
        }
      }
    }

    // 5. Subject distribution across the week (days dispersion)
    const sectionAllSubjectAssignments = assignments.filter(
      (a) =>
        a.sectionId === lesson.sectionId &&
        a.subjectId === lesson.subjectId &&
        a.instanceId !== lesson.id,
    );
    const scheduledDays = new Set(sectionAllSubjectAssignments.map((a) => a.day));
    if (scheduledDays.has(slot.day)) {
      // If subject is already scheduled on this day, prefer scheduling on another unassigned day
      penalty += 12;
    }

    return penalty;
  }
}
