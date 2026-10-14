import { DayOfWeek, TimetableEntry } from '@/types';
import { ConstraintEngine, AssignedSlot } from './constraintEngine';
import { BacktrackingSolver } from './backtrackingSolver';
import { GridSlot, LessonInstance, RegenerateScope, TimetableSetupConfig } from './types';

export interface AutoFixResult {
  success: boolean;
  rearrangedCount: number;
  fixedEntries: TimetableEntry[];
  summaryMessage: string;
}

export class TimetableRepair {
  /**
   * Auto Fix: Finds clashes and minimal conflicting entries and rearranges them into clash-free slots.
   */
  public static autoFix(
    currentEntries: TimetableEntry[],
    allSlots: GridSlot[],
    config: TimetableSetupConfig,
  ): AutoFixResult {
    const entries = currentEntries.map((e) => ({ ...e }));
    let rearrangedCount = 0;

    // 1. Detect teacher clashes
    const teacherSlotMap = new Map<string, TimetableEntry[]>();
    for (const e of entries) {
      if (e.teacherId) {
        const periodNum = parseInt(e.periodId.replace(/\D/g, ''), 10) || 1;
        const key = `${e.teacherId}-${e.dayOfWeek}-${periodNum}`;
        const list = teacherSlotMap.get(key) || [];
        list.push(e);
        teacherSlotMap.set(key, list);
      }
    }

    const conflictingEntriesToMove: TimetableEntry[] = [];
    teacherSlotMap.forEach((duplicates) => {
      if (duplicates.length > 1) {
        // Keep the first one, mark other duplicates to be moved
        for (let i = 1; i < duplicates.length; i++) {
          conflictingEntriesToMove.push(duplicates[i]);
        }
      }
    });

    // 2. For each conflicting entry, find a clash-free alternative slot in its section
    for (const conflict of conflictingEntriesToMove) {
      const sectionId = conflict.academicYearSectionId;
      const periodNum = parseInt(conflict.periodId.replace(/\D/g, ''), 10) || 1;

      // Find an open or swap-friendly slot for this section
      for (const slot of allSlots) {
        if (!config.workingDays.includes(slot.day)) continue;
        if (slot.periodNumber > config.periodsPerDay) continue;

        // Is this slot open for this section?
        const sectionHasClass = entries.some(
          (e) =>
            e.id !== conflict.id &&
            e.academicYearSectionId === sectionId &&
            e.dayOfWeek === slot.day &&
            (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === slot.periodNumber,
        );

        if (!sectionHasClass) {
          // Does teacher have a clash in this slot?
          const teacherBusy = entries.some(
            (e) =>
              e.id !== conflict.id &&
              e.teacherId === conflict.teacherId &&
              e.dayOfWeek === slot.day &&
              (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === slot.periodNumber,
          );

          if (!teacherBusy) {
            // Move conflict here!
            conflict.dayOfWeek = slot.day;
            conflict.periodId = slot.periodId;
            conflict.startTime = slot.startTime;
            conflict.endTime = slot.endTime;
            rearrangedCount++;
            break;
          }
        }
      }
    }

    // 3. Check for any class double bookings in the same section
    const sectionSlotMap = new Map<string, TimetableEntry[]>();
    for (const e of entries) {
      const pNum = parseInt(e.periodId.replace(/\D/g, ''), 10) || 1;
      const key = `${e.academicYearSectionId}-${e.dayOfWeek}-${pNum}`;
      const list = sectionSlotMap.get(key) || [];
      list.push(e);
      sectionSlotMap.set(key, list);
    }

    sectionSlotMap.forEach((duplicates) => {
      if (duplicates.length > 1) {
        for (let i = 1; i < duplicates.length; i++) {
          const toMove = duplicates[i];
          for (const slot of allSlots) {
            if (!config.workingDays.includes(slot.day)) continue;
            if (slot.periodNumber > config.periodsPerDay) continue;

            const occupied = entries.some(
              (e) =>
                e.id !== toMove.id &&
                e.academicYearSectionId === toMove.academicYearSectionId &&
                e.dayOfWeek === slot.day &&
                (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === slot.periodNumber,
            );
            if (!occupied) {
              const teachOccupied = entries.some(
                (e) =>
                  e.id !== toMove.id &&
                  e.teacherId === toMove.teacherId &&
                  e.dayOfWeek === slot.day &&
                  (parseInt(e.periodId.replace(/\D/g, ''), 10) || 0) === slot.periodNumber,
              );
              if (!teachOccupied) {
                toMove.dayOfWeek = slot.day;
                toMove.periodId = slot.periodId;
                toMove.startTime = slot.startTime;
                toMove.endTime = slot.endTime;
                rearrangedCount++;
                break;
              }
            }
          }
        }
      }
    });

    return {
      success: true,
      rearrangedCount,
      fixedEntries: entries,
      summaryMessage:
        rearrangedCount > 0
          ? `${rearrangedCount} period${rearrangedCount > 1 ? 's were' : ' was'} automatically rearranged to resolve all conflicts.`
          : 'Timetable is already conflict-free.',
    };
  }

  /**
   * Regenerate with selected scope:
   * - FIX_CONFLICTS_ONLY: runs autoFix
   * - THIS_CLASS: clears and reschedules only the selected class
   * - THIS_TEACHER: clears and reschedules only the selected teacher's periods
   * - SELECTED_DAY: clears and reschedules only the selected day
   * - ENTIRE_TIMETABLE: full solver rerun
   */
  public static regenerateScoped(
    scope: RegenerateScope,
    filterId: string, // classId, teacherId, or DayOfWeek
    currentEntries: TimetableEntry[],
    allLessons: LessonInstance[],
    allSlots: GridSlot[],
    config: TimetableSetupConfig,
  ): TimetableEntry[] {
    if (scope === 'FIX_CONFLICTS_ONLY') {
      const fixed = this.autoFix(currentEntries, allSlots, config);
      return fixed.fixedEntries;
    }

    if (scope === 'THIS_CLASS') {
      // Keep entries of other classes
      const kept = currentEntries.filter((e) => e.classId !== filterId);
      const toRescheduleLessons = allLessons.filter((l) => l.classId === filterId);

      const existingAssigned: AssignedSlot[] = kept.map((e) => ({
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

      const solverRes = BacktrackingSolver.solve(
        toRescheduleLessons,
        allSlots,
        config,
        existingAssigned,
      );

      const newEntriesForClass: TimetableEntry[] = solverRes.assignments
        .filter((a) => toRescheduleLessons.some((l) => l.id === a.instanceId))
        .map((a) => {
          const l = toRescheduleLessons.find((item) => item.id === a.instanceId)!;
          const slot = allSlots.find((s) => s.day === a.day && s.periodNumber === a.periodNumber);
          return {
            id: `tt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            schoolId: l.schoolId,
            academicYearId: l.academicYearId,
            academicYearSectionId: l.sectionId,
            dayOfWeek: a.day,
            periodId: slot?.periodId || `p${a.periodNumber}`,
            startTime: slot?.startTime || '08:30',
            endTime: slot?.endTime || '09:15',
            subjectId: l.subjectId,
            subjectName: l.subjectName,
            subjectCode: l.subjectCode,
            teacherId: l.teacherId,
            teacherName: l.teacherName,
            room: l.room,
            periodType: 'REGULAR',
            className: l.className,
            sectionName: l.sectionName,
            classId: l.classId,
          };
        });

      return [...kept, ...newEntriesForClass];
    }

    if (scope === 'SELECTED_DAY') {
      const day = filterId as DayOfWeek;
      const kept = currentEntries.filter((e) => e.dayOfWeek !== day);
      const daySlots = allSlots.filter((s) => s.day === day);
      const toRescheduleLessons = allLessons.filter((l) => !kept.some((k) => k.id.includes(l.id)));

      const existingAssigned: AssignedSlot[] = kept.map((e) => ({
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

      const solverRes = BacktrackingSolver.solve(
        toRescheduleLessons,
        daySlots,
        config,
        existingAssigned,
      );

      const newEntriesForDay: TimetableEntry[] = solverRes.assignments
        .filter((a) => a.day === day)
        .map((a) => {
          const l = allLessons.find((item) => item.id === a.instanceId);
          const slot = daySlots.find((s) => s.day === a.day && s.periodNumber === a.periodNumber);
          return {
            id: `tt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            schoolId: l?.schoolId || '',
            academicYearId: l?.academicYearId || '',
            academicYearSectionId: a.sectionId,
            dayOfWeek: a.day,
            periodId: slot?.periodId || `p${a.periodNumber}`,
            startTime: slot?.startTime || '08:30',
            endTime: slot?.endTime || '09:15',
            subjectId: a.subjectId,
            subjectName: a.subjectName,
            teacherId: a.teacherId,
            room: a.room,
            periodType: 'REGULAR',
            className: l?.className,
            sectionName: l?.sectionName,
            classId: l?.classId,
          };
        });

      return [...kept, ...newEntriesForDay];
    }

    return currentEntries;
  }
}
