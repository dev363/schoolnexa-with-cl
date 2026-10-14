import { academicService } from '../academicService';
import { AcademicYearSectionItem, ClassItem, StaffMember, SubjectItem } from '@/types';
import { LessonRequirement, TimetableSetupConfig } from './types';
import { TimetableMapper } from './timetableMapper';

export class AutoSetupService {
  /**
   * Automatically builds LessonRequirement list from existing school data in academicService
   */
  public static buildRequirementsFromSchoolData(
    schoolId: string,
    academicYearId?: string,
    config?: TimetableSetupConfig,
  ): LessonRequirement[] {
    const classes = academicService.getClassesSync(schoolId);
    const sections = academicService.getSectionsSync(schoolId, academicYearId);
    const subjects = academicService.getSubjectsSync(schoolId);
    const classSubjects = academicService.getClassSubjectsSync(schoolId);
    const assignments = academicService.getTeacherAssignmentsSync(schoolId, academicYearId);
    const staff = academicService.getStaff(schoolId);

    const requirements: LessonRequirement[] = [];

    // If no classes exist, return empty (user will see guidance or load benchmark)
    if (classes.length === 0 || sections.length === 0) {
      return [];
    }

    const defaultWeeklyPeriods = 6;

    for (const section of sections) {
      const cls = classes.find((c) => c.id === section.classId);
      if (!cls) continue;

      // Get subjects assigned to this class
      const mappedClassSubjects = classSubjects.filter((cs) => cs.classId === cls.id);

      // If class has no explicit subjects mapped, use all school subjects with sensible distribution
      const subjectsForThisClass: {
        subject: SubjectItem;
        weeklyPeriods: number;
      }[] = [];
      if (mappedClassSubjects.length > 0) {
        mappedClassSubjects.forEach((cs) => {
          const sub = subjects.find((s) => s.id === cs.subjectId);
          if (sub) {
            subjectsForThisClass.push({
              subject: sub,
              weeklyPeriods: cs.weeklyPeriods || defaultWeeklyPeriods,
            });
          }
        });
      } else {
        subjects.forEach((sub, idx) => {
          // Standard distribution
          const { isCore, isActivity } = TimetableMapper.classifySubject(sub.name);
          const weeklyPeriods = isCore ? 6 : isActivity ? 2 : 4;
          subjectsForThisClass.push({ subject: sub, weeklyPeriods });
        });
      }

      // Find teacher assignments for this section
      const sectionAssignments = assignments.filter((a) => a.academicYearSectionId === section.id);

      subjectsForThisClass.forEach(({ subject, weeklyPeriods }, index) => {
        // Find assigned teacher
        const directAssign = sectionAssignments.find(
          (a) => a.subjectId === subject.id && a.isActive,
        );
        let teacherId = directAssign?.staffId || '';
        let teacherName = '';

        if (teacherId) {
          const t = staff.find((s) => s.id === teacherId);
          teacherName = t ? `${t.firstName} ${t.lastName}` : 'Assigned Teacher';
        } else if (staff.length > 0) {
          // Sensible default round-robin teacher assignment
          const teacherIndex = (index + (section.classNumericOrder || 1)) % staff.length;
          const assignedTeacher = staff[teacherIndex];
          teacherId = assignedTeacher.id;
          teacherName = `${assignedTeacher.firstName} ${assignedTeacher.lastName}`;
        }

        const { isCore, isActivity } = TimetableMapper.classifySubject(subject.name);

        requirements.push({
          id: `req-${section.id}-${subject.id}`,
          schoolId,
          academicYearId: academicYearId || 'ay-current',
          classId: cls.id,
          className: cls.name,
          sectionId: section.id,
          sectionName: section.sectionName,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          teacherId,
          teacherName,
          room: isActivity
            ? `${subject.name} Room`
            : `Room ${(cls.numericOrder || 1) * 100 + (section.sectionName.charCodeAt(0) - 64)}`,
          periodsPerWeek: weeklyPeriods,
          maxPeriodsPerDay: isCore ? 2 : 1,
          allowConsecutive: false,
          priority: isCore ? 'HIGH' : 'NORMAL',
          isCore,
          isActivity,
        });
      });
    }

    return requirements;
  }

  /**
   * Applies the subject and weekly periods setup of a source section to target sections (e.g. Class 1-A to Class 1-B).
   */
  public static applyToSections(
    sourceSectionId: string,
    targetSectionIds: string[],
    currentRequirements: LessonRequirement[],
  ): LessonRequirement[] {
    const sourceReqs = currentRequirements.filter((r) => r.sectionId === sourceSectionId);
    if (sourceReqs.length === 0) return currentRequirements;

    // Filter out existing requirements of target sections
    const preserved = currentRequirements.filter((r) => !targetSectionIds.includes(r.sectionId));

    const newTargetReqs: LessonRequirement[] = [];
    targetSectionIds.forEach((targetSecId) => {
      // Find sample info about target section from existing requirements or synthesize
      const existingSample = currentRequirements.find((r) => r.sectionId === targetSecId);
      const className = existingSample?.className || sourceReqs[0].className;
      const classId = existingSample?.classId || sourceReqs[0].classId;
      const sectionName = existingSample?.sectionName || 'B';

      sourceReqs.forEach((src) => {
        newTargetReqs.push({
          ...src,
          id: `req-${targetSecId}-${src.subjectId}`,
          sectionId: targetSecId,
          className,
          classId,
          sectionName,
        });
      });
    });

    return [...preserved, ...newTargetReqs];
  }

  /**
   * Seeds the official Acceptance Test Scenario Data:
   * Classes: 1-A, 1-B, 2-A, 2-B, 3-A, 3-B, 4-A, 4-B, 5-A, 5-B
   * Subjects: English (6), Mathematics (6), Punjabi (5), EVS (5), Hindi (4), Computer (2), PE (2), Art (2), Library (2), Activity (2) = 36 periods/week!
   * Teachers: Anita, Rahul, Simran, Pooja, Sports Teacher, Art Teacher, Librarian, Activity Teacher
   */
  public static seedAcceptanceBenchmark(
    schoolId: string,
    academicYearId: string = 'ay-2026',
  ): {
    classes: ClassItem[];
    sections: AcademicYearSectionItem[];
    subjects: SubjectItem[];
    staff: StaffMember[];
    requirements: LessonRequirement[];
  } {
    // 1. Teachers
    const benchmarkStaff: StaffMember[] = [
      {
        id: `stf-bench-anita-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-201',
        firstName: 'Anita',
        lastName: 'Sharma',
        email: 'anita@schoolnexa.com',
        phone: '555-0101',
        gender: 'Female',
        designationName: 'Senior Teacher',
        departmentName: 'Languages & Science',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-rahul-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-202',
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'rahul@schoolnexa.com',
        phone: '555-0102',
        gender: 'Male',
        designationName: 'Master Teacher',
        departmentName: 'Mathematics & Computing',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-simran-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-203',
        firstName: 'Simran',
        lastName: 'Kaur',
        email: 'simran@schoolnexa.com',
        phone: '555-0103',
        gender: 'Female',
        designationName: 'Language Specialist',
        departmentName: 'Regional Languages',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-pooja-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-204',
        firstName: 'Pooja',
        lastName: 'Gupta',
        email: 'pooja@schoolnexa.com',
        phone: '555-0104',
        gender: 'Female',
        designationName: 'Department Head',
        departmentName: 'Hindi & Literature',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-sports-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-205',
        firstName: 'Sports',
        lastName: 'Teacher',
        email: 'sports@schoolnexa.com',
        phone: '555-0105',
        gender: 'Male',
        designationName: 'Physical Education Director',
        departmentName: 'Sports & PE',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-art-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-206',
        firstName: 'Art',
        lastName: 'Teacher',
        email: 'art@schoolnexa.com',
        phone: '555-0106',
        gender: 'Female',
        designationName: 'Visual Arts Instructor',
        departmentName: 'Fine Arts',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-librarian-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-207',
        firstName: 'Librarian',
        lastName: 'Kapoor',
        email: 'librarian@schoolnexa.com',
        phone: '555-0107',
        gender: 'Female',
        designationName: 'Head Librarian',
        departmentName: 'Library Media',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-activity-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-208',
        firstName: 'Activity',
        lastName: 'Teacher',
        email: 'activity@schoolnexa.com',
        phone: '555-0108',
        gender: 'Male',
        designationName: 'Co-Curricular Coordinator',
        departmentName: 'Activities',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-vikram-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-209',
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram@schoolnexa.com',
        phone: '555-0109',
        gender: 'Male',
        designationName: 'Teacher',
        departmentName: 'Mathematics',
        status: 'ACTIVE',
      },
      {
        id: `stf-bench-neha-${schoolId}`,
        schoolId,
        employeeCode: 'FAC-210',
        firstName: 'Neha',
        lastName: 'Patel',
        email: 'neha@schoolnexa.com',
        phone: '555-0110',
        gender: 'Female',
        designationName: 'Teacher',
        departmentName: 'Languages',
        status: 'ACTIVE',
      },
    ];

    // 2. Subjects (exact prompt specification)
    const benchmarkSubjects: SubjectItem[] = [
      {
        id: `sub-bench-eng-${schoolId}`,
        schoolId,
        name: 'English',
        code: 'ENG',
        subjectType: 'THEORY',
        credits: 4,
        isElective: false,
      },
      {
        id: `sub-bench-math-${schoolId}`,
        schoolId,
        name: 'Mathematics',
        code: 'MTH',
        subjectType: 'THEORY',
        credits: 4,
        isElective: false,
      },
      {
        id: `sub-bench-punj-${schoolId}`,
        schoolId,
        name: 'Punjabi',
        code: 'PJB',
        subjectType: 'THEORY',
        credits: 3,
        isElective: false,
      },
      {
        id: `sub-bench-evs-${schoolId}`,
        schoolId,
        name: 'EVS',
        code: 'EVS',
        subjectType: 'THEORY',
        credits: 3,
        isElective: false,
      },
      {
        id: `sub-bench-hin-${schoolId}`,
        schoolId,
        name: 'Hindi',
        code: 'HIN',
        subjectType: 'THEORY',
        credits: 3,
        isElective: false,
      },
      {
        id: `sub-bench-comp-${schoolId}`,
        schoolId,
        name: 'Computer',
        code: 'CMP',
        subjectType: 'PRACTICAL',
        credits: 2,
        isElective: false,
      },
      {
        id: `sub-bench-pe-${schoolId}`,
        schoolId,
        name: 'PE',
        code: 'PE',
        subjectType: 'ACTIVITY',
        credits: 2,
        isElective: false,
      },
      {
        id: `sub-bench-art-${schoolId}`,
        schoolId,
        name: 'Art',
        code: 'ART',
        subjectType: 'ACTIVITY',
        credits: 2,
        isElective: false,
      },
      {
        id: `sub-bench-lib-${schoolId}`,
        schoolId,
        name: 'Library',
        code: 'LIB',
        subjectType: 'ACTIVITY',
        credits: 2,
        isElective: false,
      },
      {
        id: `sub-bench-act-${schoolId}`,
        schoolId,
        name: 'Activity',
        code: 'ACT',
        subjectType: 'ACTIVITY',
        credits: 2,
        isElective: false,
      },
    ];

    // 3. Classes: Class 1, 2, 3, 4, 5
    const benchmarkClasses: ClassItem[] = [1, 2, 3, 4, 5].map((gradeNum) => ({
      id: `cls-bench-${gradeNum}-${schoolId}`,
      schoolId,
      name: `Class ${gradeNum}`,
      code: `CLS-${gradeNum}`,
      numericOrder: gradeNum,
      stream: null,
    }));

    // 4. Sections: A and B for each class (Total 10 sections)
    const benchmarkSections: AcademicYearSectionItem[] = [];
    benchmarkClasses.forEach((cls) => {
      ['A', 'B'].forEach((secName) => {
        benchmarkSections.push({
          id: `sec-bench-${cls.numericOrder}${secName.toLowerCase()}-${schoolId}`,
          schoolId,
          academicYearId,
          classId: cls.id,
          sectionName: secName,
          maxCapacity: 35,
          currentCount: 30,
          className: cls.name,
          classNumericOrder: cls.numericOrder,
        });
      });
    });

    // 5. Subject configurations & requirements mapping
    // English (6), Mathematics (6), Punjabi (5), EVS (5), Hindi (4), Computer (2), PE (2), Art (2), Library (2), Activity (2)
    // Total = 36 periods/week!
    const subjectConfig = [
      {
        subCode: 'ENG',
        periods: 6,
        defaultTeacher: 'Anita',
        isCore: true,
        isActivity: false,
      },
      {
        subCode: 'MTH',
        periods: 6,
        defaultTeacher: 'Rahul',
        isCore: true,
        isActivity: false,
      },
      {
        subCode: 'PJB',
        periods: 5,
        defaultTeacher: 'Simran',
        isCore: true,
        isActivity: false,
      },
      {
        subCode: 'EVS',
        periods: 5,
        defaultTeacher: 'Anita',
        isCore: true,
        isActivity: false,
      },
      {
        subCode: 'HIN',
        periods: 4,
        defaultTeacher: 'Pooja',
        isCore: true,
        isActivity: false,
      },
      {
        subCode: 'CMP',
        periods: 2,
        defaultTeacher: 'Rahul',
        isCore: false,
        isActivity: false,
      },
      {
        subCode: 'PE',
        periods: 2,
        defaultTeacher: 'Sports',
        isCore: false,
        isActivity: true,
      },
      {
        subCode: 'ART',
        periods: 2,
        defaultTeacher: 'Art',
        isCore: false,
        isActivity: true,
      },
      {
        subCode: 'LIB',
        periods: 2,
        defaultTeacher: 'Librarian',
        isCore: false,
        isActivity: true,
      },
      {
        subCode: 'ACT',
        periods: 2,
        defaultTeacher: 'Activity',
        isCore: false,
        isActivity: true,
      },
    ];

    const requirements: LessonRequirement[] = [];

    benchmarkSections.forEach((section) => {
      subjectConfig.forEach((cfg) => {
        const sub = benchmarkSubjects.find((s) => s.code === cfg.subCode)!;

        // Distribute teachers slightly for Section B to prevent teacher over-saturation
        let teacherFirstName = cfg.defaultTeacher;
        if (section.sectionName === 'B') {
          if (cfg.subCode === 'MTH') teacherFirstName = 'Vikram';
          else if (cfg.subCode === 'ENG') teacherFirstName = 'Neha';
        }

        const assignedStaff =
          benchmarkStaff.find((stf) => stf.firstName === teacherFirstName) || benchmarkStaff[0];

        requirements.push({
          id: `req-${section.id}-${sub.id}`,
          schoolId,
          academicYearId,
          classId: section.classId,
          className: section.className || 'Class',
          sectionId: section.id,
          sectionName: section.sectionName,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          teacherId: assignedStaff.id,
          teacherName: `${assignedStaff.firstName} ${assignedStaff.lastName}`,
          room: cfg.isActivity
            ? `${sub.name} Room`
            : `Room ${section.classNumericOrder}0${section.sectionName === 'A' ? '1' : '2'}`,
          periodsPerWeek: cfg.periods,
          maxPeriodsPerDay: cfg.isCore ? 2 : 1,
          allowConsecutive: false,
          priority: cfg.isCore ? 'HIGH' : 'NORMAL',
          isCore: cfg.isCore,
          isActivity: cfg.isActivity,
        });
      });
    });

    return {
      classes: benchmarkClasses,
      sections: benchmarkSections,
      subjects: benchmarkSubjects,
      staff: benchmarkStaff,
      requirements,
    };
  }
}
