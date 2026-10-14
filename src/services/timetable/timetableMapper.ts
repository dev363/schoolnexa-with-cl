import { DayOfWeek, TimetableEntry } from '@/types';
import { AssignedSlot } from './constraintEngine';
import { GridSlot, LessonInstance, LessonRequirement, TimetableSetupConfig } from './types';

export class TimetableMapper {
  /**
   * Generates time slots based on configuration:
   * e.g. start 08:30, duration 40 min, break after period 3 for 20 min.
   */
  public static generateGridSlots(config: TimetableSetupConfig): GridSlot[] {
    const slots: GridSlot[] = [];
    const [startHour, startMin] = config.schoolStartTime
      .split(':')
      .map((n) => parseInt(n, 10) || 0);

    for (const day of config.workingDays) {
      let currentMinutes = startHour * 60 + startMin;

      for (let p = 1; p <= config.periodsPerDay; p++) {
        // If there is a break before this period (e.g. breakAfterPeriod = 3, so before period 4)
        if (config.breakAfterPeriod > 0 && p === config.breakAfterPeriod + 1) {
          currentMinutes += config.breakDurationMinutes;
        }

        const startH = Math.floor(currentMinutes / 60);
        const startM = currentMinutes % 60;
        const endMinutes = currentMinutes + config.periodDurationMinutes;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;

        const startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        slots.push({
          day,
          periodNumber: p,
          periodId: `p${p}`,
          startTime,
          endTime,
        });

        currentMinutes = endMinutes;
      }
    }

    return slots;
  }

  /**
   * Expands LessonRequirement into individual LessonInstance objects.
   * e.g. Math with periodsPerWeek: 6 becomes 6 instances (Math #1 to #6).
   */
  public static expandRequirementsToInstances(requirements: LessonRequirement[]): LessonInstance[] {
    const instances: LessonInstance[] = [];

    for (const req of requirements) {
      const periodsCount = Math.max(0, req.periodsPerWeek);
      for (let i = 1; i <= periodsCount; i++) {
        instances.push({
          id: `${req.id}-inst-${i}`,
          requirementId: req.id,
          instanceIndex: i,
          schoolId: req.schoolId,
          academicYearId: req.academicYearId,
          classId: req.classId,
          className: req.className,
          sectionId: req.sectionId,
          sectionName: req.sectionName,
          subjectId: req.subjectId,
          subjectName: req.subjectName,
          subjectCode: req.subjectCode,
          teacherId: req.teacherId,
          teacherName: req.teacherName,
          room: req.room || `Room ${req.className.replace(/\D/g, '') || '10'}1`,
          maxPeriodsPerDay: req.maxPeriodsPerDay || 2,
          allowConsecutive: req.allowConsecutive || false,
          priority: req.priority || 'NORMAL',
          isCore: req.isCore,
          isActivity: req.isActivity,
          isFixed: req.isFixed,
          fixedDay: req.fixedDay,
          fixedPeriod: req.fixedPeriod,
        });
      }
    }

    return instances;
  }

  /**
   * Converts solver AssignedSlot[] and LessonInstance[] into official TimetableEntry[] models.
   */
  public static mapToTimetableEntries(
    assignments: AssignedSlot[],
    lessons: LessonInstance[],
    slots: GridSlot[],
  ): TimetableEntry[] {
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));
    const slotKeyMap = new Map(slots.map((s) => [`${s.day}-${s.periodNumber}`, s]));

    return assignments.map((a) => {
      const lesson = lessonMap.get(a.instanceId);
      const slot = slotKeyMap.get(`${a.day}-${a.periodNumber}`);

      return {
        id: `tt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        schoolId: lesson?.schoolId || '',
        academicYearId: lesson?.academicYearId || '',
        academicYearSectionId: a.sectionId,
        dayOfWeek: a.day,
        periodId: slot?.periodId || `p${a.periodNumber}`,
        startTime: slot?.startTime || '08:30',
        endTime: slot?.endTime || '09:15',
        subjectId: a.subjectId,
        subjectName: a.subjectName,
        subjectCode: lesson?.subjectCode || 'SUB',
        teacherId: a.teacherId,
        teacherName: lesson?.teacherName || 'Faculty',
        room: a.room || 'Room 101',
        periodType: lesson?.isActivity ? 'ACTIVITY' : 'REGULAR',
        className: lesson?.className,
        sectionName: lesson?.sectionName,
        classId: lesson?.classId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Determines if a subject is "Core" (Math, Science, English, etc.) or "Activity" (PE, Art, Library, etc.)
   */
  public static classifySubject(subjectName: string): {
    isCore: boolean;
    isActivity: boolean;
  } {
    const lower = subjectName.toLowerCase();
    const isActivity =
      lower.includes('pe') ||
      lower.includes('physical') ||
      lower.includes('sports') ||
      lower.includes('art') ||
      lower.includes('music') ||
      lower.includes('library') ||
      lower.includes('activity') ||
      lower.includes('dance') ||
      lower.includes('games');

    const isCore =
      lower.includes('math') ||
      lower.includes('english') ||
      lower.includes('science') ||
      lower.includes('physics') ||
      lower.includes('chemistry') ||
      lower.includes('biology') ||
      lower.includes('evs');

    return { isCore, isActivity };
  }
}
