import { AssignedSlot } from './constraintEngine';
import {
  HumanProblemMessage,
  LessonInstance,
  TimetableQualityReport,
  TimetableSetupConfig,
} from './types';

export class TimetableScorer {
  public static evaluate(
    assignments: AssignedSlot[],
    unscheduled: LessonInstance[],
    config: TimetableSetupConfig,
  ): TimetableQualityReport {
    let teacherClashes = 0;
    let classClashes = 0;
    let roomClashes = 0;
    let softWarnings = 0;
    const messages: HumanProblemMessage[] = [];

    // 1. Check Hard Clashes in assignments
    const teacherSlots = new Map<string, AssignedSlot>();
    const sectionSlots = new Map<string, AssignedSlot>();
    const roomSlots = new Map<string, AssignedSlot>();

    for (const a of assignments) {
      // Section slot
      const secKey = `${a.sectionId}-${a.day}-${a.periodNumber}`;
      if (sectionSlots.has(secKey)) {
        classClashes++;
        const prev = sectionSlots.get(secKey)!;
        messages.push({
          id: `class-clash-${secKey}`,
          type: 'HARD_CLASH',
          title: 'Class Double Booking',
          description: `Class section has both ${prev.subjectName} and ${a.subjectName} scheduled on ${a.day} Period ${a.periodNumber}.`,
          affectedClass: a.sectionId,
          affectedSubject: a.subjectName,
          suggestedActions: [
            'Move one of the subjects to another available period',
            'Click Auto Fix Timetable',
          ],
        });
      } else {
        sectionSlots.set(secKey, a);
      }

      // Teacher slot
      if (a.teacherId) {
        const teachKey = `${a.teacherId}-${a.day}-${a.periodNumber}`;
        if (teacherSlots.has(teachKey)) {
          teacherClashes++;
          const prev = teacherSlots.get(teachKey)!;
          messages.push({
            id: `teach-clash-${teachKey}`,
            type: 'HARD_CLASH',
            title: 'Teacher Schedule Conflict',
            description: `Teacher is assigned to two different classes on ${a.day} Period ${a.periodNumber}.`,
            affectedTeacher: a.teacherId,
            suggestedActions: [
              'Reassign one class to a co-teacher',
              'Move period to an open slot',
              'Click Auto Fix Timetable',
            ],
          });
        } else {
          teacherSlots.set(teachKey, a);
        }
      }

      // Room slot
      if (a.room && a.room.trim() !== '' && !a.room.toLowerCase().includes('regular')) {
        const rKey = `${a.room.trim().toLowerCase()}-${a.day}-${a.periodNumber}`;
        if (roomSlots.has(rKey)) {
          roomClashes++;
          messages.push({
            id: `room-clash-${rKey}`,
            type: 'HARD_CLASH',
            title: 'Room Double Booking',
            description: `Room ${a.room} is occupied by multiple classes on ${a.day} Period ${a.periodNumber}.`,
            suggestedActions: ['Change room assignment', 'Move period to an open slot'],
          });
        } else {
          roomSlots.set(rKey, a);
        }
      }
    }

    // 2. Unscheduled Periods Check (Human-friendly messages)
    if (unscheduled.length > 0) {
      // Group by class and subject
      const groupedUnscheduled = new Map<string, { count: number; lesson: LessonInstance }>();
      for (const u of unscheduled) {
        const key = `${u.className} - ${u.sectionName} - ${u.subjectName}`;
        if (groupedUnscheduled.has(key)) {
          groupedUnscheduled.get(key)!.count++;
        } else {
          groupedUnscheduled.set(key, { count: 1, lesson: u });
        }
      }

      groupedUnscheduled.forEach(({ count, lesson }) => {
        messages.push({
          id: `unscheduled-${lesson.sectionId}-${lesson.subjectId}`,
          type: 'UNSCHEDULED',
          title: `${count} period${count > 1 ? 's' : ''} could not be scheduled`,
          description: `${lesson.className} (${lesson.sectionName}) — ${lesson.subjectName}. Teacher ${lesson.teacherName} is already teaching another class during the remaining slots or reached daily capacity.`,
          affectedClass: `${lesson.className} (${lesson.sectionName})`,
          affectedTeacher: lesson.teacherName,
          affectedSubject: lesson.subjectName,
          suggestedActions: [
            'Change teacher in Step 2',
            'Allow consecutive periods in Advanced Settings',
            'Review teacher availability',
            'Click Auto Fix',
          ],
        });
      });
    }

    // 3. Soft warnings: Consecutive periods without allowance or teacher workload
    const sectionDayGroups = new Map<string, AssignedSlot[]>();
    for (const a of assignments) {
      const key = `${a.sectionId}-${a.day}`;
      const list = sectionDayGroups.get(key) || [];
      list.push(a);
      sectionDayGroups.set(key, list);
    }

    sectionDayGroups.forEach((slots) => {
      slots.sort((x, y) => x.periodNumber - y.periodNumber);
      for (let i = 0; i < slots.length - 1; i++) {
        if (
          slots[i].subjectId === slots[i + 1].subjectId &&
          slots[i + 1].periodNumber === slots[i].periodNumber + 1 &&
          !slots[i].allowConsecutive
        ) {
          softWarnings++;
        }
      }
    });

    // Score calculation
    const hardConflicts = teacherClashes + classClashes + roomClashes;
    let score = 100;
    score -= hardConflicts * 25;
    score -= unscheduled.length * 10;
    score -= softWarnings * 2;
    if (score < 0) score = 0;

    let status: 'NO_CONFLICTS' | 'NEEDS_REVIEW' | 'PROBLEMS_FOUND' = 'NO_CONFLICTS';
    if (hardConflicts > 0 || unscheduled.length > 0) {
      status = 'PROBLEMS_FOUND';
    } else if (softWarnings > 5) {
      status = 'NEEDS_REVIEW';
    }

    return {
      status,
      hardConflicts,
      softWarnings,
      unscheduledPeriods: unscheduled.length,
      teacherClashes,
      classClashes,
      roomClashes,
      messages,
      score,
    };
  }
}
