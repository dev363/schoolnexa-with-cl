import { ConstraintEngine, AssignedSlot } from './constraintEngine';
import { GridSlot, LessonInstance, TimetableSetupConfig } from './types';

export class CandidateGenerator {
  /**
   * Generates all valid candidate slots for a given lesson instance,
   * sorted from best (lowest soft penalty) to worst.
   */
  public static getCandidateSlots(
    lesson: LessonInstance,
    allSlots: GridSlot[],
    currentAssignments: AssignedSlot[],
    config: TimetableSetupConfig,
  ): { slot: GridSlot; penalty: number }[] {
    const validCandidates: { slot: GridSlot; penalty: number }[] = [];

    for (const slot of allSlots) {
      const hardCheck = ConstraintEngine.canAssignHard(lesson, slot, currentAssignments, config);
      if (hardCheck.valid) {
        const penalty = ConstraintEngine.calculateSoftPenalty(
          lesson,
          slot,
          currentAssignments,
          config,
        );
        validCandidates.push({ slot, penalty });
      }
    }

    // Sort by penalty ascending (best penalty first)
    // Add small pseudorandom jitter for tied penalties to prevent deterministic clumping
    validCandidates.sort((a, b) => {
      if (a.penalty !== b.penalty) {
        return a.penalty - b.penalty;
      }
      return Math.random() - 0.5;
    });

    return validCandidates;
  }
}
