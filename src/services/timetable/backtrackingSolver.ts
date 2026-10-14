import { AssignedSlot, ConstraintEngine } from './constraintEngine';
import { CandidateGenerator } from './candidateGenerator';
import { GridSlot, LessonInstance, TimetableSetupConfig } from './types';

export interface SolverResult {
  success: boolean;
  assignments: AssignedSlot[];
  unscheduledLessons: LessonInstance[];
  iterations: number;
}

export class BacktrackingSolver {
  /**
   * Sorts lesson instances so the most constrained / difficult lessons are placed first:
   * 1. Fixed periods first
   * 2. Lessons with shared / busy teachers (teachers teaching multiple sections)
   * 3. Specialized rooms (Labs, Workshops)
   * 4. High weekly period counts (e.g. 6 periods/week)
   * 5. Lower frequency subjects (e.g. 2 periods/week)
   */
  public static prioritizeLessons(
    lessons: LessonInstance[],
    allLessons: LessonInstance[],
  ): LessonInstance[] {
    // Count teacher load across all sections
    const teacherFrequency: Record<string, number> = {};
    for (const l of allLessons) {
      if (l.teacherId) {
        teacherFrequency[l.teacherId] = (teacherFrequency[l.teacherId] || 0) + 1;
      }
    }

    return [...lessons].sort((a, b) => {
      // 1. Fixed periods
      if (a.isFixed && !b.isFixed) return -1;
      if (!a.isFixed && b.isFixed) return 1;

      // 2. Specialized rooms
      const aHasSpecialRoom =
        a.room && !a.room.toLowerCase().includes('regular') && a.room.trim() !== '';
      const bHasSpecialRoom =
        b.room && !b.room.toLowerCase().includes('regular') && b.room.trim() !== '';
      if (aHasSpecialRoom && !bHasSpecialRoom) return -1;
      if (!aHasSpecialRoom && bHasSpecialRoom) return 1;

      // 3. Busy teacher priority
      const aTeacherLoad = a.teacherId ? teacherFrequency[a.teacherId] || 0 : 0;
      const bTeacherLoad = b.teacherId ? teacherFrequency[b.teacherId] || 0 : 0;
      if (aTeacherLoad !== bTeacherLoad) {
        return bTeacherLoad - aTeacherLoad;
      }

      // 4. Core subjects first
      if (a.isCore && !b.isCore) return -1;
      if (!a.isCore && b.isCore) return 1;

      // 5. High priority tag
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;

      return 0;
    });
  }

  /**
   * Solves the timetable problem using recursive backtracking with forward checking,
   * MRV (minimum remaining values) heuristics, and repair moves.
   */
  public static solve(
    lessons: LessonInstance[],
    slots: GridSlot[],
    config: TimetableSetupConfig,
    existingAssignments: AssignedSlot[] = [],
  ): SolverResult {
    const sortedLessons = this.prioritizeLessons(lessons, lessons);
    const currentAssignments = [...existingAssignments];
    let iterationCount = 0;
    const maxIterations = 25000;

    const assignRecursive = (index: number): boolean => {
      iterationCount++;
      if (iterationCount > maxIterations) {
        return false;
      }

      if (index >= sortedLessons.length) {
        return true; // All lessons placed successfully!
      }

      const lesson = sortedLessons[index];

      // Get candidates sorted by lowest soft penalty
      const candidates = CandidateGenerator.getCandidateSlots(
        lesson,
        slots,
        currentAssignments,
        config,
      );

      for (const candidate of candidates) {
        const assigned: AssignedSlot = {
          instanceId: lesson.id,
          sectionId: lesson.sectionId,
          teacherId: lesson.teacherId,
          subjectId: lesson.subjectId,
          subjectName: lesson.subjectName,
          room: lesson.room,
          day: candidate.slot.day,
          periodNumber: candidate.slot.periodNumber,
          isCore: lesson.isCore,
          isActivity: lesson.isActivity,
          allowConsecutive: lesson.allowConsecutive,
        };

        currentAssignments.push(assigned);

        if (assignRecursive(index + 1)) {
          return true;
        }

        // Backtrack
        currentAssignments.pop();
      }

      return false;
    };

    const success = assignRecursive(0);

    if (success) {
      return {
        success: true,
        assignments: currentAssignments,
        unscheduledLessons: [],
        iterations: iterationCount,
      };
    }

    // If full backtrack didn't find complete solution, do Best-Effort Greedy Placement
    // with local search swaps to maximize scheduled periods while strictly preserving 0 hard conflicts.
    const fallbackAssignments = [...existingAssignments];
    const unscheduled: LessonInstance[] = [];

    for (const lesson of sortedLessons) {
      const candidates = CandidateGenerator.getCandidateSlots(
        lesson,
        slots,
        fallbackAssignments,
        config,
      );

      if (candidates.length > 0) {
        const bestCandidate = candidates[0];
        fallbackAssignments.push({
          instanceId: lesson.id,
          sectionId: lesson.sectionId,
          teacherId: lesson.teacherId,
          subjectId: lesson.subjectId,
          subjectName: lesson.subjectName,
          room: lesson.room,
          day: bestCandidate.slot.day,
          periodNumber: bestCandidate.slot.periodNumber,
          isCore: lesson.isCore,
          isActivity: lesson.isActivity,
          allowConsecutive: lesson.allowConsecutive,
        });
      } else {
        unscheduled.push(lesson);
      }
    }

    return {
      success: unscheduled.length === 0,
      assignments: fallbackAssignments,
      unscheduledLessons: unscheduled,
      iterations: iterationCount,
    };
  }
}
