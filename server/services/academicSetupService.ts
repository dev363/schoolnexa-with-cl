import prisma from '../prisma';
import { AppError } from '../middleware/errorHandler';
import {
  ClassDto,
  CreateClassInput,
  UpdateClassInput,
  SectionDto,
  CreateSectionInput,
  UpdateSectionInput,
  SubjectDto,
  CreateSubjectInput,
  UpdateSubjectInput,
  ClassSubjectDto,
  CreateClassSubjectInput,
  UpdateClassSubjectInput,
  BulkCurriculumMappingInput,
  TeacherAssignmentDto,
  CreateTeacherAssignmentInput,
  UpdateTeacherAssignmentInput,
} from '../types/academicSetup';
import { PaginationParams, PaginationMetadata } from '../types';
import { buildPagination } from '../utils/pagination';
import { getInternalIdPrefix } from '../utils/identifiers';

// ==========================================
// FALLBACK SEED DATA FOR DEMO ENVIRONMENTS
// ==========================================

let fallbackClasses = [
  {
    id: 'cls-oak-g6',
    schoolId: 'school-oakridge-01',
    name: 'Grade 6',
    code: 'G-06',
    numericOrder: 6,
    stream: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cls-oak-g7',
    schoolId: 'school-oakridge-01',
    name: 'Grade 7',
    code: 'G-07',
    numericOrder: 7,
    stream: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cls-oak-g8',
    schoolId: 'school-oakridge-01',
    name: 'Grade 8',
    code: 'G-08',
    numericOrder: 8,
    stream: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cls-oak-g9',
    schoolId: 'school-oakridge-01',
    name: 'Grade 9',
    code: 'G-09',
    numericOrder: 9,
    stream: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cls-oak-g10',
    schoolId: 'school-oakridge-01',
    name: 'Grade 10',
    code: 'G-10',
    numericOrder: 10,
    stream: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cls-oak-g11',
    schoolId: 'school-oakridge-01',
    name: 'Grade 11',
    code: 'G-11-SCI',
    numericOrder: 11,
    stream: 'SCIENCE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cls-oak-g12',
    schoolId: 'school-oakridge-01',
    name: 'Grade 12',
    code: 'G-12-SCI',
    numericOrder: 12,
    stream: 'SCIENCE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // St. Xavier classes for cross-tenant testing
  {
    id: 'cls-stx-g10',
    schoolId: 'school-stxavier-02',
    name: 'Grade 10',
    code: 'STX-G10',
    numericOrder: 10,
    stream: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let fallbackSections = [
  {
    id: 'sec-oak-8a',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g8',
    sectionName: 'A',
    maxCapacity: 35,
    currentCount: 32,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sec-oak-8b',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g8',
    sectionName: 'B',
    maxCapacity: 35,
    currentCount: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sec-oak-9a',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g9',
    sectionName: 'A',
    maxCapacity: 35,
    currentCount: 34,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sec-oak-9b',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g9',
    sectionName: 'B',
    maxCapacity: 35,
    currentCount: 33,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sec-oak-10a',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g10',
    sectionName: 'A',
    maxCapacity: 35,
    currentCount: 35,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sec-oak-10b',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g10',
    sectionName: 'B',
    maxCapacity: 35,
    currentCount: 31,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // St. Xavier section
  {
    id: 'sec-stx-10a',
    schoolId: 'school-stxavier-02',
    academicYearId: 'ay-stm-2025',
    classId: 'cls-stx-g10',
    sectionName: 'A',
    maxCapacity: 30,
    currentCount: 28,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let fallbackSubjects = [
  {
    id: 'sub-oak-math',
    schoolId: 'school-oakridge-01',
    name: 'Advanced Mathematics',
    code: 'MTH-101',
    subjectType: 'THEORY',
    credits: 4,
    isElective: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sub-oak-eng',
    schoolId: 'school-oakridge-01',
    name: 'English Literature & Composition',
    code: 'ENG-101',
    subjectType: 'THEORY',
    credits: 4,
    isElective: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sub-oak-sci',
    schoolId: 'school-oakridge-01',
    name: 'General Science & Lab',
    code: 'SCI-101',
    subjectType: 'HYBRID',
    credits: 4,
    isElective: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sub-oak-soc',
    schoolId: 'school-oakridge-01',
    name: 'World History & Civics',
    code: 'SOC-101',
    subjectType: 'THEORY',
    credits: 3,
    isElective: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sub-oak-cs',
    schoolId: 'school-oakridge-01',
    name: 'Computer Science & Robotics',
    code: 'CSC-101',
    subjectType: 'PRACTICAL',
    credits: 3,
    isElective: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sub-oak-art',
    schoolId: 'school-oakridge-01',
    name: 'Visual & Performing Arts',
    code: 'ART-101',
    subjectType: 'ACTIVITY',
    credits: 2,
    isElective: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // St. Xavier subject
  {
    id: 'sub-stx-chem',
    schoolId: 'school-stxavier-02',
    name: 'Inorganic Chemistry',
    code: 'CHM-101',
    subjectType: 'THEORY',
    credits: 4,
    isElective: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let fallbackClassSubjects = [
  {
    id: 'cs-8-math',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-math',
    isMandatory: true,
    weeklyPeriods: 6,
    createdAt: new Date(),
  },
  {
    id: 'cs-8-eng',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-eng',
    isMandatory: true,
    weeklyPeriods: 5,
    createdAt: new Date(),
  },
  {
    id: 'cs-8-sci',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-sci',
    isMandatory: true,
    weeklyPeriods: 5,
    createdAt: new Date(),
  },
  {
    id: 'cs-8-soc',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-soc',
    isMandatory: true,
    weeklyPeriods: 4,
    createdAt: new Date(),
  },
  {
    id: 'cs-8-cs',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-cs',
    isMandatory: false,
    weeklyPeriods: 3,
    createdAt: new Date(),
  },
  {
    id: 'cs-9-math',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g9',
    subjectId: 'sub-oak-math',
    isMandatory: true,
    weeklyPeriods: 6,
    createdAt: new Date(),
  },
  {
    id: 'cs-9-sci',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g9',
    subjectId: 'sub-oak-sci',
    isMandatory: true,
    weeklyPeriods: 6,
    createdAt: new Date(),
  },
  {
    id: 'cs-10-math',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g10',
    subjectId: 'sub-oak-math',
    isMandatory: true,
    weeklyPeriods: 6,
    createdAt: new Date(),
  },
  {
    id: 'cs-10-sci',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g10',
    subjectId: 'sub-oak-sci',
    isMandatory: true,
    weeklyPeriods: 6,
    createdAt: new Date(),
  },
];

export interface FallbackSyllabus {
  id: string;
  schoolId: string;
  classSubjectId: string;
  academicYearId: string;
  term: string;
  chapterNumber: number;
  chapterTitle: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

let fallbackSyllabi: FallbackSyllabus[] = [
  {
    id: 'syl-8-math-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-math',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 8 Mathematics Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-8-eng-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-eng',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 8 English & Grammar Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-8-sci-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-sci',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 8 General Science Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-8-soc-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-soc',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 8 Social Studies Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-8-cs-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-cs',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Computer Applications & Coding',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-9-math-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-9-math',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 9 Mathematics Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-9-sci-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-9-sci',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 9 Science & Experiments Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-10-math-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-10-math',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 10 Board Math Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'syl-10-sci-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-10-sci',
    academicYearId: 'ay-oak-2025',
    term: 'ANNUAL',
    chapterNumber: 1,
    chapterTitle: 'Grade 10 Physics & Chemistry Syllabus',
    status: 'PLANNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let fallbackTeacherAssignments = [
  {
    id: 'asg-8a-ct',
    schoolId: 'school-oakridge-01',
    academicYearSectionId: 'sec-oak-8a',
    staffId: 'stf-oak-01',
    subjectId: null as string | null,
    isClassTeacher: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'asg-8a-math',
    schoolId: 'school-oakridge-01',
    academicYearSectionId: 'sec-oak-8a',
    staffId: 'stf-oak-01',
    subjectId: 'sub-oak-math',
    isClassTeacher: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'asg-8a-eng',
    schoolId: 'school-oakridge-01',
    academicYearSectionId: 'sec-oak-8a',
    staffId: 'stf-oak-02',
    subjectId: 'sub-oak-eng',
    isClassTeacher: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const academicSetupService = {
  // ==========================================
  // CLASSES
  // ==========================================

  async listClasses(
    schoolId: string,
    pagination: PaginationParams,
    search?: string,
  ): Promise<{ data: ClassDto[]; meta: PaginationMetadata }> {
    try {
      const where: any = { schoolId };
      if (search && search.trim()) {
        const term = search.trim();
        where.OR = [{ name: { contains: term } }, { code: { contains: term } }];
      }

      const [total, records] = await Promise.all([
        prisma.class.count({ where }),
        prisma.class.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { numericOrder: 'asc' },
          include: {
            _count: {
              select: {
                academicYearSections: true,
                classSubjects: true,
              },
            },
          },
        }),
      ]);

      const data: ClassDto[] = records.map((r) => ({
        id: r.id,
        schoolId: r.schoolId,
        name: r.name,
        code: r.code,
        numericOrder: r.numericOrder,
        stream: r.stream,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        sectionsCount: r._count.academicYearSections,
        subjectsCount: r._count.classSubjects,
      }));

      return {
        data,
        meta: buildPagination(total, pagination.page, pagination.pageSize),
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      let filtered = fallbackClasses.filter((c) => c.schoolId === schoolId);
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s),
        );
      }
      filtered.sort((a, b) => a.numericOrder - b.numericOrder);

      const total = filtered.length;
      const paginated = filtered.slice(pagination.skip, pagination.skip + pagination.take);

      const data: ClassDto[] = paginated.map((c) => ({
        id: c.id,
        schoolId: c.schoolId,
        name: c.name,
        code: c.code,
        numericOrder: c.numericOrder,
        stream: c.stream,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        sectionsCount: fallbackSections.filter((s) => s.classId === c.id).length,
        subjectsCount: fallbackClassSubjects.filter((cs) => cs.classId === c.id).length,
      }));

      return {
        data,
        meta: buildPagination(total, pagination.page, pagination.pageSize),
      };
    }
  },

  async getClassById(schoolId: string, id: string): Promise<ClassDto> {
    try {
      const cls = await prisma.class.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              academicYearSections: true,
              classSubjects: true,
            },
          },
        },
      });

      if (!cls) {
        throw new AppError('Class not found', 404, [
          { message: 'Class does not exist', code: 'CLASS_NOT_FOUND' },
        ]);
      }

      if (cls.schoolId !== schoolId) {
        throw new AppError('Forbidden: Class belongs to another school', 403, [
          { message: 'Class belongs to a different school tenant', code: 'CLASS_FORBIDDEN' },
        ]);
      }

      return {
        id: cls.id,
        schoolId: cls.schoolId,
        name: cls.name,
        code: cls.code,
        numericOrder: cls.numericOrder,
        stream: cls.stream,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
        sectionsCount: cls._count.academicYearSections,
        subjectsCount: cls._count.classSubjects,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const globalMatch = fallbackClasses.find((c) => c.id === id);
      if (globalMatch && globalMatch.schoolId !== schoolId) {
        throw new AppError('Forbidden: Class belongs to another school', 403, [
          { message: 'Class belongs to a different school tenant', code: 'CLASS_FORBIDDEN' },
        ]);
      }

      const cls = fallbackClasses.find((c) => c.id === id && c.schoolId === schoolId);
      if (!cls) {
        throw new AppError('Class not found', 404, [
          { message: 'Class does not exist', code: 'CLASS_NOT_FOUND' },
        ]);
      }

      return {
        id: cls.id,
        schoolId: cls.schoolId,
        name: cls.name,
        code: cls.code,
        numericOrder: cls.numericOrder,
        stream: cls.stream,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
        sectionsCount: fallbackSections.filter((s) => s.classId === cls.id).length,
        subjectsCount: fallbackClassSubjects.filter((cs) => cs.classId === cls.id).length,
      };
    }
  },

  async createClass(schoolId: string, input: CreateClassInput): Promise<ClassDto> {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    try {
      const existing = await prisma.class.findFirst({
        where: { schoolId, code },
      });

      if (existing) {
        throw new AppError(`Class with code "${code}" already exists in this school`, 409, [
          { message: 'Class code must be unique per school', code: 'DUPLICATE_CLASS_CODE' },
        ]);
      }

      const created = await prisma.class.create({
        data: {
          schoolId,
          name,
          code,
          numericOrder: input.numericOrder,
          stream: input.stream?.trim() || null,
        },
      });

      return {
        id: created.id,
        schoolId: created.schoolId,
        name: created.name,
        code: created.code,
        numericOrder: created.numericOrder,
        stream: created.stream,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        sectionsCount: 0,
        subjectsCount: 0,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const existing = fallbackClasses.find(
        (c) => c.schoolId === schoolId && c.code.toUpperCase() === code,
      );
      if (existing) {
        throw new AppError(`Class with code "${code}" already exists in this school`, 409, [
          { message: 'Class code must be unique per school', code: 'DUPLICATE_CLASS_CODE' },
        ]);
      }

      const newCls = {
        id: `${getInternalIdPrefix('class')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        name,
        code,
        numericOrder: input.numericOrder,
        stream: input.stream?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackClasses.push(newCls);

      return {
        ...newCls,
        sectionsCount: 0,
        subjectsCount: 0,
      };
    }
  },

  async updateClass(schoolId: string, id: string, input: UpdateClassInput): Promise<ClassDto> {
    await this.getClassById(schoolId, id);

    try {
      if (input.code) {
        const code = input.code.trim().toUpperCase();
        const conflict = await prisma.class.findFirst({
          where: {
            schoolId,
            code,
            id: { not: id },
          },
        });
        if (conflict) {
          throw new AppError(`Class code "${code}" is already in use by another class`, 409, [
            { message: 'Class code must be unique per school', code: 'DUPLICATE_CLASS_CODE' },
          ]);
        }
      }

      const updated = await prisma.class.update({
        where: { id },
        data: {
          ...(input.name ? { name: input.name.trim() } : {}),
          ...(input.code ? { code: input.code.trim().toUpperCase() } : {}),
          ...(input.numericOrder !== undefined ? { numericOrder: input.numericOrder } : {}),
          ...(input.stream !== undefined
            ? { stream: input.stream ? input.stream.trim() : null }
            : {}),
        },
        include: {
          _count: {
            select: {
              academicYearSections: true,
              classSubjects: true,
            },
          },
        },
      });

      return {
        id: updated.id,
        schoolId: updated.schoolId,
        name: updated.name,
        code: updated.code,
        numericOrder: updated.numericOrder,
        stream: updated.stream,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        sectionsCount: updated._count.academicYearSections,
        subjectsCount: updated._count.classSubjects,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      if (input.code) {
        const code = input.code.trim().toUpperCase();
        const conflict = fallbackClasses.find(
          (c) => c.schoolId === schoolId && c.code.toUpperCase() === code && c.id !== id,
        );
        if (conflict) {
          throw new AppError(`Class code "${code}" is already in use by another class`, 409, [
            { message: 'Class code must be unique per school', code: 'DUPLICATE_CLASS_CODE' },
          ]);
        }
      }

      const cls = fallbackClasses.find((c) => c.id === id)!;
      if (input.name) cls.name = input.name.trim();
      if (input.code) cls.code = input.code.trim().toUpperCase();
      if (input.numericOrder !== undefined) cls.numericOrder = input.numericOrder;
      if (input.stream !== undefined) cls.stream = input.stream ? input.stream.trim() : null;
      cls.updatedAt = new Date();

      return {
        ...cls,
        sectionsCount: fallbackSections.filter((s) => s.classId === cls.id).length,
        subjectsCount: fallbackClassSubjects.filter((cs) => cs.classId === cls.id).length,
      };
    }
  },

  async deleteClass(schoolId: string, id: string): Promise<void> {
    await this.getClassById(schoolId, id);

    try {
      const [sectionsCount, subjectsCount] = await Promise.all([
        prisma.academicYearSection.count({ where: { schoolId, classId: id } }),
        prisma.classSubject.count({ where: { schoolId, classId: id } }),
      ]);

      if (sectionsCount > 0 || subjectsCount > 0) {
        throw new AppError(
          `Cannot delete class: it has ${sectionsCount} section(s) and ${subjectsCount} curriculum subject(s) associated with it. Remove dependencies first.`,
          409,
          [{ message: 'Class has existing dependencies', code: 'CANNOT_DELETE_HAS_DEPENDENCIES' }],
        );
      }

      await prisma.class.delete({ where: { id } });
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const sectionsCount = fallbackSections.filter((s) => s.classId === id).length;
      const subjectsCount = fallbackClassSubjects.filter((cs) => cs.classId === id).length;

      if (sectionsCount > 0 || subjectsCount > 0) {
        throw new AppError(
          `Cannot delete class: it has ${sectionsCount} section(s) and ${subjectsCount} curriculum subject(s) associated with it. Remove dependencies first.`,
          409,
          [{ message: 'Class has existing dependencies', code: 'CANNOT_DELETE_HAS_DEPENDENCIES' }],
        );
      }

      fallbackClasses = fallbackClasses.filter((c) => c.id !== id);
    }
  },

  // ==========================================
  // SECTIONS (AcademicYearSection)
  // ==========================================

  async listSections(
    schoolId: string,
    academicYearId?: string,
    pagination: PaginationParams = { page: 1, pageSize: 50, skip: 0, take: 50 },
    classId?: string,
    search?: string,
  ): Promise<{ data: SectionDto[]; meta: PaginationMetadata }> {
    try {
      const where: any = { schoolId };
      if (academicYearId && academicYearId !== 'ALL') {
        where.academicYearId = academicYearId;
      }
      if (classId) {
        where.classId = classId;
      }
      if (search && search.trim()) {
        where.sectionName = { contains: search.trim() };
      }

      const [total, records] = await Promise.all([
        prisma.academicYearSection.count({ where }),
        prisma.academicYearSection.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: [{ class: { numericOrder: 'asc' } }, { sectionName: 'asc' }],
          include: {
            class: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        }),
      ]);

      const data: SectionDto[] = records.map((r) => ({
        id: r.id,
        schoolId: r.schoolId,
        academicYearId: r.academicYearId,
        classId: r.classId,
        className: r.class?.name,
        classCode: r.class?.code,
        sectionName: r.sectionName,
        maxCapacity: r.maxCapacity,
        currentCount: r.currentCount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      return {
        data,
        meta: buildPagination(total, pagination.page, pagination.pageSize),
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      let filtered = fallbackSections.filter((s) => s.schoolId === schoolId);
      if (academicYearId && academicYearId !== 'ALL') {
        filtered = filtered.filter((s) => s.academicYearId === academicYearId);
      }
      if (classId) {
        filtered = filtered.filter((s) => s.classId === classId);
      }
      if (search && search.trim()) {
        filtered = filtered.filter((s) =>
          s.sectionName.toLowerCase().includes(search.trim().toLowerCase()),
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(pagination.skip, pagination.skip + pagination.take);

      const data: SectionDto[] = paginated.map((s) => {
        const cls = fallbackClasses.find((c) => c.id === s.classId);
        return {
          id: s.id,
          schoolId: s.schoolId,
          academicYearId: s.academicYearId,
          classId: s.classId,
          className: cls?.name,
          classCode: cls?.code,
          sectionName: s.sectionName,
          maxCapacity: s.maxCapacity,
          currentCount: s.currentCount,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        };
      });

      return {
        data,
        meta: buildPagination(total, pagination.page, pagination.pageSize),
      };
    }
  },

  async getSectionById(schoolId: string, academicYearId: string, id: string): Promise<SectionDto> {
    try {
      const section = await prisma.academicYearSection.findUnique({
        where: { id },
        include: {
          class: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      if (!section) {
        throw new AppError('Section not found', 404, [
          { message: 'Academic year section does not exist', code: 'SECTION_NOT_FOUND' },
        ]);
      }

      if (section.schoolId !== schoolId) {
        throw new AppError('Forbidden: Section belongs to another school', 403, [
          { message: 'Section belongs to a different school tenant', code: 'SECTION_FORBIDDEN' },
        ]);
      }

      if (section.academicYearId !== academicYearId) {
        throw new AppError('Section belongs to a different academic year', 400, [
          { message: 'Section academic year mismatch', code: 'SECTION_YEAR_MISMATCH' },
        ]);
      }

      return {
        id: section.id,
        schoolId: section.schoolId,
        academicYearId: section.academicYearId,
        classId: section.classId,
        className: section.class?.name,
        classCode: section.class?.code,
        sectionName: section.sectionName,
        maxCapacity: section.maxCapacity,
        currentCount: section.currentCount,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const globalMatch = fallbackSections.find((s) => s.id === id);
      if (globalMatch && globalMatch.schoolId !== schoolId) {
        throw new AppError('Forbidden: Section belongs to another school', 403, [
          { message: 'Section belongs to a different school tenant', code: 'SECTION_FORBIDDEN' },
        ]);
      }

      const section = fallbackSections.find((s) => s.id === id && s.schoolId === schoolId);
      if (!section) {
        throw new AppError('Section not found', 404, [
          { message: 'Academic year section does not exist', code: 'SECTION_NOT_FOUND' },
        ]);
      }

      if (section.academicYearId !== academicYearId) {
        throw new AppError('Section belongs to a different academic year', 400, [
          { message: 'Section academic year mismatch', code: 'SECTION_YEAR_MISMATCH' },
        ]);
      }

      const cls = fallbackClasses.find((c) => c.id === section.classId);

      return {
        id: section.id,
        schoolId: section.schoolId,
        academicYearId: section.academicYearId,
        classId: section.classId,
        className: cls?.name,
        classCode: cls?.code,
        sectionName: section.sectionName,
        maxCapacity: section.maxCapacity,
        currentCount: section.currentCount,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      };
    }
  },

  async createSection(
    schoolId: string,
    academicYearId: string,
    input: CreateSectionInput,
  ): Promise<SectionDto> {
    // 1. Verify Class exists and belongs to active school tenant
    await this.getClassById(schoolId, input.classId);

    let effectiveAcademicYearId = academicYearId;
    if (!effectiveAcademicYearId) {
      effectiveAcademicYearId =
        fallbackSections.find((s) => s.schoolId === schoolId)?.academicYearId || 'ay-oak-2025';
    }

    const sectionName = input.sectionName.trim().toUpperCase();

    try {
      const existing = await prisma.academicYearSection.findFirst({
        where: {
          schoolId,
          ...(effectiveAcademicYearId ? { academicYearId: effectiveAcademicYearId } : {}),
          classId: input.classId,
          sectionName,
        },
      });

      if (existing) {
        throw new AppError(`Section "${sectionName}" already exists for this class`, 409, [
          { message: 'Section name must be unique per class', code: 'DUPLICATE_SECTION_NAME' },
        ]);
      }

      const created = await prisma.academicYearSection.create({
        data: {
          schoolId,
          academicYearId: effectiveAcademicYearId,
          classId: input.classId,
          sectionName,
          maxCapacity: input.maxCapacity ?? 40,
        },
        include: {
          class: { select: { id: true, name: true, code: true } },
        },
      });

      return {
        id: created.id,
        schoolId: created.schoolId,
        academicYearId: created.academicYearId,
        classId: created.classId,
        className: created.class?.name,
        classCode: created.class?.code,
        sectionName: created.sectionName,
        maxCapacity: created.maxCapacity,
        currentCount: created.currentCount,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const existing = fallbackSections.find(
        (s) =>
          s.schoolId === schoolId &&
          s.classId === input.classId &&
          s.sectionName.toUpperCase() === sectionName,
      );

      if (existing) {
        throw new AppError(`Section "${sectionName}" already exists for this class`, 409, [
          { message: 'Section name must be unique per class', code: 'DUPLICATE_SECTION_NAME' },
        ]);
      }

      const cls = fallbackClasses.find((c) => c.id === input.classId)!;
      const newSec = {
        id: `${getInternalIdPrefix('section')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        academicYearId: effectiveAcademicYearId,
        classId: input.classId,
        sectionName,
        maxCapacity: input.maxCapacity ?? 40,
        currentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackSections.push(newSec);

      return {
        ...newSec,
        className: cls.name,
        classCode: cls.code,
      };
    }
  },

  async updateSection(
    schoolId: string,
    academicYearId: string,
    id: string,
    input: UpdateSectionInput,
  ): Promise<SectionDto> {
    const current = await this.getSectionById(schoolId, academicYearId, id);

    try {
      if (input.sectionName) {
        const name = input.sectionName.trim().toUpperCase();
        const conflict = await prisma.academicYearSection.findFirst({
          where: {
            schoolId,
            academicYearId,
            classId: current.classId,
            sectionName: name,
            id: { not: id },
          },
        });
        if (conflict) {
          throw new AppError(
            `Section "${name}" is already in use for this class in active academic year`,
            409,
            [
              {
                message: 'Section name must be unique per class and academic year',
                code: 'DUPLICATE_SECTION_NAME',
              },
            ],
          );
        }
      }

      const updated = await prisma.academicYearSection.update({
        where: { id },
        data: {
          ...(input.sectionName ? { sectionName: input.sectionName.trim().toUpperCase() } : {}),
          ...(input.maxCapacity !== undefined ? { maxCapacity: input.maxCapacity } : {}),
        },
        include: {
          class: { select: { id: true, name: true, code: true } },
        },
      });

      return {
        id: updated.id,
        schoolId: updated.schoolId,
        academicYearId: updated.academicYearId,
        classId: updated.classId,
        className: updated.class?.name,
        classCode: updated.class?.code,
        sectionName: updated.sectionName,
        maxCapacity: updated.maxCapacity,
        currentCount: updated.currentCount,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      if (input.sectionName) {
        const name = input.sectionName.trim().toUpperCase();
        const conflict = fallbackSections.find(
          (s) =>
            s.schoolId === schoolId &&
            s.academicYearId === academicYearId &&
            s.classId === current.classId &&
            s.sectionName.toUpperCase() === name &&
            s.id !== id,
        );
        if (conflict) {
          throw new AppError(
            `Section "${name}" is already in use for this class in active academic year`,
            409,
            [
              {
                message: 'Section name must be unique per class and academic year',
                code: 'DUPLICATE_SECTION_NAME',
              },
            ],
          );
        }
      }

      const sec = fallbackSections.find((s) => s.id === id)!;
      if (input.sectionName) sec.sectionName = input.sectionName.trim().toUpperCase();
      if (input.maxCapacity !== undefined) sec.maxCapacity = input.maxCapacity;
      sec.updatedAt = new Date();

      const cls = fallbackClasses.find((c) => c.id === sec.classId);

      return {
        ...sec,
        className: cls?.name,
        classCode: cls?.code,
      };
    }
  },

  async deleteSection(schoolId: string, academicYearId: string, id: string): Promise<void> {
    await this.getSectionById(schoolId, academicYearId, id);

    try {
      const [enrollmentCount, assignmentCount] = await Promise.all([
        prisma.enrollment.count({ where: { schoolId, academicYearSectionId: id } }),
        prisma.teacherAssignment.count({ where: { schoolId, academicYearSectionId: id } }),
      ]);

      if (enrollmentCount > 0 || assignmentCount > 0) {
        throw new AppError(
          `Cannot delete section: it has ${enrollmentCount} enrolled student(s) and ${assignmentCount} teacher assignment(s). Remove dependencies first.`,
          409,
          [
            {
              message: 'Section has existing dependencies',
              code: 'CANNOT_DELETE_HAS_DEPENDENCIES',
            },
          ],
        );
      }

      await prisma.academicYearSection.delete({ where: { id } });
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const assignmentCount = fallbackTeacherAssignments.filter(
        (a) => a.academicYearSectionId === id,
      ).length;

      if (assignmentCount > 0) {
        throw new AppError(
          `Cannot delete section: it has active teacher assignments. Remove dependencies first.`,
          409,
          [
            {
              message: 'Section has existing dependencies',
              code: 'CANNOT_DELETE_HAS_DEPENDENCIES',
            },
          ],
        );
      }

      fallbackSections = fallbackSections.filter((s) => s.id !== id);
    }
  },

  // ==========================================
  // SUBJECTS
  // ==========================================

  async listSubjects(
    schoolId: string,
    pagination: PaginationParams,
    search?: string,
    subjectType?: string,
    isElective?: boolean,
  ): Promise<{ data: SubjectDto[]; meta: PaginationMetadata }> {
    try {
      const where: any = { schoolId };
      if (search && search.trim()) {
        const term = search.trim();
        where.OR = [{ name: { contains: term } }, { code: { contains: term } }];
      }
      if (subjectType) {
        where.subjectType = subjectType;
      }
      if (isElective !== undefined) {
        where.isElective = isElective;
      }

      const [total, records] = await Promise.all([
        prisma.subject.count({ where }),
        prisma.subject.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { name: 'asc' },
        }),
      ]);

      const data: SubjectDto[] = records.map((r) => ({
        id: r.id,
        schoolId: r.schoolId,
        name: r.name,
        code: r.code,
        subjectType: r.subjectType,
        credits: Number(r.credits),
        isElective: r.isElective,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      return {
        data,
        meta: buildPagination(total, pagination.page, pagination.pageSize),
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      let filtered = fallbackSubjects.filter((s) => s.schoolId === schoolId);
      if (search && search.trim()) {
        const term = search.trim().toLowerCase();
        filtered = filtered.filter(
          (s) => s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term),
        );
      }
      if (subjectType) {
        filtered = filtered.filter((s) => s.subjectType === subjectType);
      }
      if (isElective !== undefined) {
        filtered = filtered.filter((s) => s.isElective === isElective);
      }
      filtered.sort((a, b) => a.name.localeCompare(b.name));

      const total = filtered.length;
      const paginated = filtered.slice(pagination.skip, pagination.skip + pagination.take);

      return {
        data: paginated,
        meta: buildPagination(total, pagination.page, pagination.pageSize),
      };
    }
  },

  async getSubjectById(schoolId: string, id: string): Promise<SubjectDto> {
    try {
      const sub = await prisma.subject.findUnique({
        where: { id },
      });

      if (!sub) {
        throw new AppError('Subject not found', 404, [
          { message: 'Subject does not exist', code: 'SUBJECT_NOT_FOUND' },
        ]);
      }

      if (sub.schoolId !== schoolId) {
        throw new AppError('Forbidden: Subject belongs to another school', 403, [
          { message: 'Subject belongs to a different school tenant', code: 'SUBJECT_FORBIDDEN' },
        ]);
      }

      return {
        id: sub.id,
        schoolId: sub.schoolId,
        name: sub.name,
        code: sub.code,
        subjectType: sub.subjectType,
        credits: Number(sub.credits),
        isElective: sub.isElective,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const globalMatch = fallbackSubjects.find((s) => s.id === id);
      if (globalMatch && globalMatch.schoolId !== schoolId) {
        throw new AppError('Forbidden: Subject belongs to another school', 403, [
          { message: 'Subject belongs to a different school tenant', code: 'SUBJECT_FORBIDDEN' },
        ]);
      }

      const sub = fallbackSubjects.find((s) => s.id === id && s.schoolId === schoolId);
      if (!sub) {
        throw new AppError('Subject not found', 404, [
          { message: 'Subject does not exist', code: 'SUBJECT_NOT_FOUND' },
        ]);
      }

      return sub;
    }
  },

  async createSubject(schoolId: string, input: CreateSubjectInput): Promise<SubjectDto> {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    try {
      const existing = await prisma.subject.findFirst({
        where: { schoolId, code },
      });

      if (existing) {
        throw new AppError(`Subject with code "${code}" already exists in this school`, 409, [
          { message: 'Subject code must be unique per school', code: 'DUPLICATE_SUBJECT_CODE' },
        ]);
      }

      const created = await prisma.subject.create({
        data: {
          schoolId,
          name,
          code,
          subjectType: input.subjectType?.trim().toUpperCase() || 'THEORY',
          credits: input.credits ?? 1.0,
          isElective: Boolean(input.isElective),
        },
      });

      return {
        id: created.id,
        schoolId: created.schoolId,
        name: created.name,
        code: created.code,
        subjectType: created.subjectType,
        credits: Number(created.credits),
        isElective: created.isElective,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const existing = fallbackSubjects.find(
        (s) => s.schoolId === schoolId && s.code.toUpperCase() === code,
      );
      if (existing) {
        throw new AppError(`Subject with code "${code}" already exists in this school`, 409, [
          { message: 'Subject code must be unique per school', code: 'DUPLICATE_SUBJECT_CODE' },
        ]);
      }

      const newSub = {
        id: `${getInternalIdPrefix('subject')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        name,
        code,
        subjectType: input.subjectType?.trim().toUpperCase() || 'THEORY',
        credits: input.credits ?? 1.0,
        isElective: Boolean(input.isElective),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackSubjects.push(newSub);

      return newSub;
    }
  },

  async updateSubject(
    schoolId: string,
    id: string,
    input: UpdateSubjectInput,
  ): Promise<SubjectDto> {
    await this.getSubjectById(schoolId, id);

    try {
      if (input.code) {
        const code = input.code.trim().toUpperCase();
        const conflict = await prisma.subject.findFirst({
          where: {
            schoolId,
            code,
            id: { not: id },
          },
        });
        if (conflict) {
          throw new AppError(`Subject code "${code}" is already in use by another subject`, 409, [
            { message: 'Subject code must be unique per school', code: 'DUPLICATE_SUBJECT_CODE' },
          ]);
        }
      }

      const updated = await prisma.subject.update({
        where: { id },
        data: {
          ...(input.name ? { name: input.name.trim() } : {}),
          ...(input.code ? { code: input.code.trim().toUpperCase() } : {}),
          ...(input.subjectType ? { subjectType: input.subjectType.trim().toUpperCase() } : {}),
          ...(input.credits !== undefined ? { credits: input.credits } : {}),
          ...(input.isElective !== undefined ? { isElective: input.isElective } : {}),
        },
      });

      return {
        id: updated.id,
        schoolId: updated.schoolId,
        name: updated.name,
        code: updated.code,
        subjectType: updated.subjectType,
        credits: Number(updated.credits),
        isElective: updated.isElective,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      if (input.code) {
        const code = input.code.trim().toUpperCase();
        const conflict = fallbackSubjects.find(
          (s) => s.schoolId === schoolId && s.code.toUpperCase() === code && s.id !== id,
        );
        if (conflict) {
          throw new AppError(`Subject code "${code}" is already in use by another subject`, 409, [
            { message: 'Subject code must be unique per school', code: 'DUPLICATE_SUBJECT_CODE' },
          ]);
        }
      }

      const sub = fallbackSubjects.find((s) => s.id === id)!;
      if (input.name) sub.name = input.name.trim();
      if (input.code) sub.code = input.code.trim().toUpperCase();
      if (input.subjectType) sub.subjectType = input.subjectType.trim().toUpperCase();
      if (input.credits !== undefined) sub.credits = input.credits;
      if (input.isElective !== undefined) sub.isElective = input.isElective;
      sub.updatedAt = new Date();

      return sub;
    }
  },

  async deleteSubject(schoolId: string, id: string): Promise<void> {
    await this.getSubjectById(schoolId, id);

    try {
      const [classSubjectsCount, assignmentsCount] = await Promise.all([
        prisma.classSubject.count({ where: { schoolId, subjectId: id } }),
        prisma.teacherAssignment.count({ where: { schoolId, subjectId: id } }),
      ]);

      if (classSubjectsCount > 0 || assignmentsCount > 0) {
        throw new AppError(
          `Cannot delete subject: it is mapped to ${classSubjectsCount} class(es) and assigned to ${assignmentsCount} teacher(s). Remove dependencies first.`,
          409,
          [
            {
              message: 'Subject has existing dependencies',
              code: 'CANNOT_DELETE_HAS_DEPENDENCIES',
            },
          ],
        );
      }

      await prisma.subject.delete({ where: { id } });
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const classSubjectsCount = fallbackClassSubjects.filter((cs) => cs.subjectId === id).length;
      const assignmentsCount = fallbackTeacherAssignments.filter(
        (ta) => ta.subjectId === id,
      ).length;

      if (classSubjectsCount > 0 || assignmentsCount > 0) {
        throw new AppError(
          `Cannot delete subject: it is mapped to ${classSubjectsCount} class(es) and assigned to ${assignmentsCount} teacher(s). Remove dependencies first.`,
          409,
          [
            {
              message: 'Subject has existing dependencies',
              code: 'CANNOT_DELETE_HAS_DEPENDENCIES',
            },
          ],
        );
      }

      fallbackSubjects = fallbackSubjects.filter((s) => s.id !== id);
    }
  },

  // ==========================================
  // CURRICULUM (ClassSubject Mapping)
  // ==========================================

  async listCurriculum(
    schoolId: string,
    academicYearId?: string,
    classId?: string,
    subjectId?: string,
  ): Promise<ClassSubjectDto[]> {
    try {
      const where: any = { schoolId };
      if (classId) where.classId = classId;
      if (subjectId) where.subjectId = subjectId;
      if (academicYearId) {
        where.syllabi = {
          some: { academicYearId },
        };
      }

      const records = await prisma.classSubject.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          syllabi: academicYearId
            ? {
                where: { academicYearId },
                select: { id: true, chapterTitle: true, academicYearId: true },
              }
            : { select: { id: true, chapterTitle: true, academicYearId: true } },
        },
        orderBy: [{ class: { numericOrder: 'asc' } }, { subject: { name: 'asc' } }],
      });

      return records.map((r: any) => {
        const matchedSyllabus = r.syllabi && r.syllabi.length > 0 ? r.syllabi[0] : null;
        return {
          id: r.id,
          schoolId: r.schoolId,
          academicYearId: matchedSyllabus?.academicYearId || academicYearId || undefined,
          classId: r.classId,
          className: r.class?.name,
          subjectId: r.subjectId,
          subjectName: r.subject?.name,
          subjectCode: r.subject?.code,
          syllabusId: matchedSyllabus?.id,
          syllabusName: matchedSyllabus?.chapterTitle,
          isMandatory: r.isMandatory,
          weeklyPeriods: r.weeklyPeriods,
          createdAt: r.createdAt,
        };
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      let filtered = fallbackClassSubjects.filter((cs: any) => cs.schoolId === schoolId);
      if (classId) filtered = filtered.filter((cs: any) => cs.classId === classId);
      if (subjectId) filtered = filtered.filter((cs: any) => cs.subjectId === subjectId);

      // Strictly filter by academicYearId if provided
      if (academicYearId) {
        filtered = filtered.filter((cs: any) => {
          if (cs.academicYearId && cs.academicYearId === academicYearId) return true;
          return fallbackSyllabi.some(
            (s) =>
              s.schoolId === schoolId &&
              s.classSubjectId === cs.id &&
              s.academicYearId === academicYearId,
          );
        });
      }

      return filtered.map((cs: any) => {
        const cls = fallbackClasses.find((c) => c.id === cs.classId);
        const sub = fallbackSubjects.find((s) => s.id === cs.subjectId);
        const matchedSyllabus = academicYearId
          ? fallbackSyllabi.find(
              (s) =>
                s.schoolId === schoolId &&
                s.classSubjectId === cs.id &&
                s.academicYearId === academicYearId,
            )
          : fallbackSyllabi.find((s) => s.schoolId === schoolId && s.classSubjectId === cs.id);

        return {
          id: cs.id,
          schoolId: cs.schoolId,
          academicYearId: matchedSyllabus?.academicYearId || cs.academicYearId || academicYearId,
          classId: cs.classId,
          className: cls?.name,
          subjectId: cs.subjectId,
          subjectName: sub?.name,
          subjectCode: sub?.code,
          syllabusId: matchedSyllabus?.id,
          syllabusName: matchedSyllabus?.chapterTitle,
          isMandatory: cs.isMandatory,
          weeklyPeriods: cs.weeklyPeriods,
          createdAt: cs.createdAt,
        };
      });
    }
  },

  async getCurriculumById(
    schoolId: string,
    id: string,
    academicYearId?: string,
  ): Promise<ClassSubjectDto> {
    try {
      const record = await prisma.classSubject.findUnique({
        where: { id },
        include: {
          class: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          syllabi: academicYearId
            ? {
                where: { academicYearId },
                select: { id: true, chapterTitle: true, academicYearId: true },
              }
            : { select: { id: true, chapterTitle: true, academicYearId: true } },
        },
      });

      if (!record) {
        throw new AppError('Curriculum mapping not found', 404, [
          { message: 'Class-subject mapping does not exist', code: 'CURRICULUM_NOT_FOUND' },
        ]);
      }

      if (record.schoolId !== schoolId) {
        throw new AppError('Forbidden: Curriculum mapping belongs to another school', 403, [
          {
            message: 'Curriculum mapping belongs to a different school tenant',
            code: 'CURRICULUM_FORBIDDEN',
          },
        ]);
      }

      const matchedSyllabus =
        record.syllabi && record.syllabi.length > 0 ? record.syllabi[0] : null;

      return {
        id: record.id,
        schoolId: record.schoolId,
        academicYearId: matchedSyllabus?.academicYearId || academicYearId || undefined,
        classId: record.classId,
        className: record.class?.name,
        subjectId: record.subjectId,
        subjectName: record.subject?.name,
        subjectCode: record.subject?.code,
        syllabusId: matchedSyllabus?.id,
        syllabusName: matchedSyllabus?.chapterTitle,
        isMandatory: record.isMandatory,
        weeklyPeriods: record.weeklyPeriods,
        createdAt: record.createdAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const globalMatch = fallbackClassSubjects.find((cs) => cs.id === id);
      if (globalMatch && globalMatch.schoolId !== schoolId) {
        throw new AppError('Forbidden: Curriculum mapping belongs to another school', 403, [
          {
            message: 'Curriculum mapping belongs to a different school tenant',
            code: 'CURRICULUM_FORBIDDEN',
          },
        ]);
      }

      const match = fallbackClassSubjects.find((cs) => cs.id === id && cs.schoolId === schoolId);
      if (!match) {
        throw new AppError('Curriculum mapping not found', 404, [
          { message: 'Class-subject mapping does not exist', code: 'CURRICULUM_NOT_FOUND' },
        ]);
      }

      const cls = fallbackClasses.find((c) => c.id === match.classId);
      const sub = fallbackSubjects.find((s) => s.id === match.subjectId);
      const matchedSyllabus = academicYearId
        ? fallbackSyllabi.find(
            (s) =>
              s.schoolId === schoolId &&
              s.classSubjectId === match.id &&
              s.academicYearId === academicYearId,
          )
        : fallbackSyllabi.find((s) => s.schoolId === schoolId && s.classSubjectId === match.id);

      return {
        id: match.id,
        schoolId: match.schoolId,
        academicYearId: matchedSyllabus?.academicYearId || academicYearId,
        classId: match.classId,
        className: cls?.name,
        subjectId: match.subjectId,
        subjectName: sub?.name,
        subjectCode: sub?.code,
        syllabusId: matchedSyllabus?.id,
        syllabusName: matchedSyllabus?.chapterTitle,
        isMandatory: match.isMandatory,
        weeklyPeriods: match.weeklyPeriods,
        createdAt: match.createdAt,
      };
    }
  },

  async createCurriculum(
    schoolId: string,
    input: CreateClassSubjectInput,
  ): Promise<ClassSubjectDto> {
    // 1. Validate that Class and Subject both belong to this active school tenant
    const [cls, sub] = await Promise.all([
      this.getClassById(schoolId, input.classId),
      this.getSubjectById(schoolId, input.subjectId),
    ]);

    const academicYearId = input.academicYearId || 'ay-oak-2025';
    const syllabusName = input.syllabusName || `${sub.name} Syllabus`;

    try {
      const existing = await prisma.classSubject.findFirst({
        where: {
          schoolId,
          classId: input.classId,
          subjectId: input.subjectId,
        },
      });

      let created: any;
      if (existing) {
        // Update existing mapping for this class and subject
        created = await prisma.classSubject.update({
          where: { id: existing.id },
          data: {
            isMandatory:
              input.isMandatory !== undefined ? Boolean(input.isMandatory) : existing.isMandatory,
            weeklyPeriods: input.weeklyPeriods ?? existing.weeklyPeriods,
          },
          include: {
            class: { select: { id: true, name: true, code: true } },
            subject: { select: { id: true, name: true, code: true } },
          },
        });
      } else {
        created = await prisma.classSubject.create({
          data: {
            schoolId,
            classId: input.classId,
            subjectId: input.subjectId,
            isMandatory: input.isMandatory !== undefined ? Boolean(input.isMandatory) : true,
            weeklyPeriods: input.weeklyPeriods ?? 4,
          },
          include: {
            class: { select: { id: true, name: true, code: true } },
            subject: { select: { id: true, name: true, code: true } },
          },
        });
      }

      // Upsert Syllabus record for this academic year if possible
      let createdSyllabusId: string | undefined;
      try {
        if (academicYearId) {
          const existingSyllabus = await prisma.syllabus.findFirst({
            where: { schoolId, classSubjectId: created.id, academicYearId },
          });
          if (existingSyllabus) {
            const updatedSyl = await prisma.syllabus.update({
              where: { id: existingSyllabus.id },
              data: { chapterTitle: syllabusName },
            });
            createdSyllabusId = updatedSyl.id;
          } else {
            const newSyl = await prisma.syllabus.create({
              data: {
                schoolId,
                classSubjectId: created.id,
                academicYearId,
                term: 'ANNUAL',
                chapterNumber: 1,
                chapterTitle: syllabusName,
              },
            });
            createdSyllabusId = newSyl.id;
          }
        }
      } catch (sErr) {
        // Silently continue if syllabus table has constraint variations
      }

      return {
        id: created.id,
        schoolId: created.schoolId,
        academicYearId,
        classId: created.classId,
        className: created.class?.name,
        subjectId: created.subjectId,
        subjectName: created.subject?.name,
        subjectCode: created.subject?.code,
        syllabusId: createdSyllabusId,
        syllabusName,
        isMandatory: created.isMandatory,
        weeklyPeriods: created.weeklyPeriods,
        createdAt: created.createdAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const existing = fallbackClassSubjects.find(
        (cs) =>
          cs.schoolId === schoolId &&
          cs.classId === input.classId &&
          cs.subjectId === input.subjectId,
      );

      let mappingId: string;
      let mappingRecord: any;

      if (existing) {
        existing.isMandatory =
          input.isMandatory !== undefined ? Boolean(input.isMandatory) : existing.isMandatory;
        existing.weeklyPeriods = input.weeklyPeriods ?? existing.weeklyPeriods;
        mappingId = existing.id;
        mappingRecord = existing;
      } else {
        mappingId = `${getInternalIdPrefix('classSubject')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        mappingRecord = {
          id: mappingId,
          schoolId,
          classId: input.classId,
          subjectId: input.subjectId,
          isMandatory: input.isMandatory !== undefined ? Boolean(input.isMandatory) : true,
          weeklyPeriods: input.weeklyPeriods ?? 4,
          createdAt: new Date(),
        };
        fallbackClassSubjects.push(mappingRecord);
      }

      let matchedSylId: string | undefined;
      let matchedSylTitle: string | undefined;
      if (syllabusName && academicYearId) {
        const existingSyl = fallbackSyllabi.find(
          (s) =>
            s.schoolId === schoolId &&
            s.classSubjectId === mappingId &&
            s.academicYearId === academicYearId,
        );
        if (existingSyl) {
          existingSyl.chapterTitle = syllabusName;
          existingSyl.updatedAt = new Date();
          matchedSylId = existingSyl.id;
          matchedSylTitle = existingSyl.chapterTitle;
        } else {
          matchedSylId = `${getInternalIdPrefix('syllabus')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          matchedSylTitle = syllabusName;
          fallbackSyllabi.push({
            id: matchedSylId,
            schoolId,
            classSubjectId: mappingId,
            academicYearId,
            term: 'ANNUAL',
            chapterNumber: 1,
            chapterTitle: syllabusName,
            status: 'PLANNED',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return {
        ...mappingRecord,
        academicYearId,
        className: cls.name,
        subjectId: input.subjectId,
        subjectName: sub.name,
        subjectCode: sub.code,
        syllabusId: matchedSylId,
        syllabusName: matchedSylTitle,
      };
    }
  },

  async updateCurriculum(
    schoolId: string,
    id: string,
    input: UpdateClassSubjectInput,
  ): Promise<ClassSubjectDto> {
    await this.getCurriculumById(schoolId, id, input.academicYearId);
    const targetYearId = input.academicYearId;

    try {
      const updated = await prisma.classSubject.update({
        where: { id },
        data: {
          ...(input.isMandatory !== undefined ? { isMandatory: Boolean(input.isMandatory) } : {}),
          ...(input.weeklyPeriods !== undefined ? { weeklyPeriods: input.weeklyPeriods } : {}),
        },
        include: {
          class: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      });

      let matchedSyllabus: any = null;
      if (input.syllabusName !== undefined) {
        if (targetYearId) {
          const existingSyl = await prisma.syllabus.findFirst({
            where: { schoolId, classSubjectId: id, academicYearId: targetYearId },
          });
          if (existingSyl) {
            matchedSyllabus = await prisma.syllabus.update({
              where: { id: existingSyl.id },
              data: { chapterTitle: input.syllabusName },
            });
          } else if (input.syllabusName.trim()) {
            matchedSyllabus = await prisma.syllabus.create({
              data: {
                schoolId,
                classSubjectId: id,
                academicYearId: targetYearId,
                term: 'ANNUAL',
                chapterNumber: 1,
                chapterTitle: input.syllabusName.trim(),
              },
            });
          }
        }
      } else if (targetYearId) {
        matchedSyllabus = await prisma.syllabus.findFirst({
          where: { schoolId, classSubjectId: id, academicYearId: targetYearId },
        });
      }

      return {
        id: updated.id,
        schoolId: updated.schoolId,
        academicYearId: targetYearId,
        classId: updated.classId,
        className: updated.class?.name,
        subjectId: updated.subjectId,
        subjectName: updated.subject?.name,
        subjectCode: updated.subject?.code,
        syllabusId: matchedSyllabus?.id,
        syllabusName: matchedSyllabus?.chapterTitle,
        isMandatory: updated.isMandatory,
        weeklyPeriods: updated.weeklyPeriods,
        createdAt: updated.createdAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const mapping = fallbackClassSubjects.find((cs) => cs.id === id)!;
      if (input.isMandatory !== undefined) mapping.isMandatory = Boolean(input.isMandatory);
      if (input.weeklyPeriods !== undefined) mapping.weeklyPeriods = input.weeklyPeriods;

      let matchedSyllabus: FallbackSyllabus | undefined;
      if (input.syllabusName !== undefined && targetYearId) {
        const existingSyl = fallbackSyllabi.find(
          (s) =>
            s.schoolId === schoolId && s.classSubjectId === id && s.academicYearId === targetYearId,
        );
        if (existingSyl) {
          existingSyl.chapterTitle = input.syllabusName;
          existingSyl.updatedAt = new Date();
          matchedSyllabus = existingSyl;
        } else if (input.syllabusName.trim()) {
          matchedSyllabus = {
            id: `${getInternalIdPrefix('syllabus')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            schoolId,
            classSubjectId: id,
            academicYearId: targetYearId,
            term: 'ANNUAL',
            chapterNumber: 1,
            chapterTitle: input.syllabusName.trim(),
            status: 'PLANNED',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          fallbackSyllabi.push(matchedSyllabus);
        }
      } else if (targetYearId) {
        matchedSyllabus = fallbackSyllabi.find(
          (s) =>
            s.schoolId === schoolId && s.classSubjectId === id && s.academicYearId === targetYearId,
        );
      }

      const cls = fallbackClasses.find((c) => c.id === mapping.classId);
      const sub = fallbackSubjects.find((s) => s.id === mapping.subjectId);

      return {
        ...mapping,
        academicYearId: targetYearId,
        className: cls?.name,
        subjectName: sub?.name,
        subjectCode: sub?.code,
        syllabusId: matchedSyllabus?.id,
        syllabusName: matchedSyllabus?.chapterTitle,
      };
    }
  },

  async deleteCurriculum(schoolId: string, id: string, academicYearId?: string): Promise<void> {
    await this.getCurriculumById(schoolId, id, academicYearId);

    try {
      if (academicYearId) {
        try {
          await prisma.syllabus.deleteMany({
            where: { schoolId, classSubjectId: id, academicYearId },
          });
          const remaining = await prisma.syllabus.count({
            where: { schoolId, classSubjectId: id },
          });
          if (remaining === 0) {
            await prisma.classSubject.delete({ where: { id } }).catch(() => {});
          }
        } catch {
          await prisma.classSubject.delete({ where: { id } });
        }
      } else {
        await prisma.syllabus
          .deleteMany({ where: { schoolId, classSubjectId: id } })
          .catch(() => {});
        await prisma.classSubject.delete({ where: { id } });
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      if (academicYearId) {
        fallbackSyllabi = fallbackSyllabi.filter(
          (s) =>
            !(
              s.schoolId === schoolId &&
              s.classSubjectId === id &&
              s.academicYearId === academicYearId
            ),
        );
        const remaining = fallbackSyllabi.filter((s) => s.classSubjectId === id);
        if (remaining.length === 0) {
          fallbackClassSubjects = fallbackClassSubjects.filter((cs) => cs.id !== id);
        }
      } else {
        fallbackClassSubjects = fallbackClassSubjects.filter((cs) => cs.id !== id);
        fallbackSyllabi = fallbackSyllabi.filter((s) => s.classSubjectId !== id);
      }
    }
  },

  async bulkCurriculumMapping(
    schoolId: string,
    input: BulkCurriculumMappingInput,
  ): Promise<{ mappedCount: number; classId: string }> {
    // 1. Validate class belongs to school
    await this.getClassById(schoolId, input.classId);

    // 2. Validate all subjects belong to school
    for (const subId of input.subjectIds) {
      await this.getSubjectById(schoolId, subId);
    }

    const academicYearId = input.academicYearId || 'ay-oak-2025';
    const isMandatory = input.isMandatory !== undefined ? Boolean(input.isMandatory) : true;
    const weeklyPeriods = input.weeklyPeriods ?? 4;

    try {
      // Transactional bulk mapping in Prisma
      await prisma.$transaction(async (tx) => {
        for (const subId of input.subjectIds) {
          const existing = await tx.classSubject.findFirst({
            where: { schoolId, classId: input.classId, subjectId: subId },
          });
          let csRecord: any;
          if (existing) {
            csRecord = await tx.classSubject.update({
              where: { id: existing.id },
              data: { isMandatory, weeklyPeriods },
            });
          } else {
            csRecord = await tx.classSubject.create({
              data: {
                schoolId,
                classId: input.classId,
                subjectId: subId,
                isMandatory,
                weeklyPeriods,
              },
            });
          }

          if (input.syllabusName && academicYearId) {
            try {
              const syl = await tx.syllabus.findFirst({
                where: { schoolId, classSubjectId: csRecord.id, academicYearId },
              });
              if (syl) {
                await tx.syllabus.update({
                  where: { id: syl.id },
                  data: { chapterTitle: input.syllabusName },
                });
              } else {
                await tx.syllabus.create({
                  data: {
                    schoolId,
                    classSubjectId: csRecord.id,
                    academicYearId,
                    term: 'ANNUAL',
                    chapterNumber: 1,
                    chapterTitle: input.syllabusName,
                  },
                });
              }
            } catch {
              // ignore
            }
          }
        }
      });

      return {
        mappedCount: input.subjectIds.length,
        classId: input.classId,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      for (const subId of input.subjectIds) {
        let csRecord = fallbackClassSubjects.find(
          (cs) =>
            cs.schoolId === schoolId && cs.classId === input.classId && cs.subjectId === subId,
        );
        if (csRecord) {
          csRecord.isMandatory = isMandatory;
          csRecord.weeklyPeriods = weeklyPeriods;
        } else {
          csRecord = {
            id: `${getInternalIdPrefix('classSubject')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            schoolId,
            classId: input.classId,
            subjectId: subId,
            isMandatory,
            weeklyPeriods,
            createdAt: new Date(),
          };
          fallbackClassSubjects.push(csRecord);
        }

        if (input.syllabusName && academicYearId) {
          const existingSyl = fallbackSyllabi.find(
            (s) =>
              s.schoolId === schoolId &&
              s.classSubjectId === csRecord!.id &&
              s.academicYearId === academicYearId,
          );
          if (existingSyl) {
            existingSyl.chapterTitle = input.syllabusName;
            existingSyl.updatedAt = new Date();
          } else {
            fallbackSyllabi.push({
              id: `${getInternalIdPrefix('syllabus')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
              schoolId,
              classSubjectId: csRecord!.id,
              academicYearId,
              term: 'ANNUAL',
              chapterNumber: 1,
              chapterTitle: input.syllabusName,
              status: 'PLANNED',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
      return {
        mappedCount: input.subjectIds.length,
        classId: input.classId,
      };
    }
  },

  // ==========================================
  // TEACHER ASSIGNMENTS (Class & Subject Teacher)
  // ==========================================

  async listAssignments(
    schoolId: string,
    academicYearId: string,
    sectionId?: string,
    staffId?: string,
    isClassTeacher?: boolean,
  ): Promise<TeacherAssignmentDto[]> {
    try {
      const where: any = {
        schoolId,
        section: { academicYearId },
      };
      if (sectionId) where.academicYearSectionId = sectionId;
      if (staffId) where.staffId = staffId;
      if (isClassTeacher !== undefined) where.isClassTeacher = isClassTeacher;

      const records = await prisma.teacherAssignment.findMany({
        where,
        include: {
          section: {
            include: {
              class: { select: { id: true, name: true, code: true } },
            },
          },
          staff: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
          subject: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: [{ isClassTeacher: 'desc' }, { createdAt: 'desc' }],
      });

      return records.map((r) => ({
        id: r.id,
        schoolId: r.schoolId,
        academicYearSectionId: r.academicYearSectionId,
        sectionName: r.section?.sectionName,
        className: r.section?.class?.name,
        staffId: r.staffId,
        staffName: `${r.staff?.firstName || ''} ${r.staff?.lastName || ''}`.trim(),
        subjectId: r.subjectId,
        subjectName: r.subject?.name,
        isClassTeacher: r.isClassTeacher,
        isActive: r.isActive,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      let filtered = fallbackTeacherAssignments.filter((a) => a.schoolId === schoolId);

      // Verify sections are in this academic year
      filtered = filtered.filter((a) => {
        const sec = fallbackSections.find((s) => s.id === a.academicYearSectionId);
        return sec && sec.academicYearId === academicYearId;
      });

      if (sectionId) filtered = filtered.filter((a) => a.academicYearSectionId === sectionId);
      if (staffId) filtered = filtered.filter((a) => a.staffId === staffId);
      if (isClassTeacher !== undefined)
        filtered = filtered.filter((a) => a.isClassTeacher === isClassTeacher);

      return filtered.map((a) => {
        const sec = fallbackSections.find((s) => s.id === a.academicYearSectionId);
        const cls = sec ? fallbackClasses.find((c) => c.id === sec.classId) : null;
        const sub = a.subjectId ? fallbackSubjects.find((s) => s.id === a.subjectId) : null;

        return {
          id: a.id,
          schoolId: a.schoolId,
          academicYearSectionId: a.academicYearSectionId,
          sectionName: sec?.sectionName,
          className: cls?.name,
          staffId: a.staffId,
          staffName: 'Staff Member',
          subjectId: a.subjectId,
          subjectName: sub?.name || null,
          isClassTeacher: a.isClassTeacher,
          isActive: a.isActive,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        };
      });
    }
  },

  async createAssignment(
    schoolId: string,
    academicYearId: string,
    input: CreateTeacherAssignmentInput,
  ): Promise<TeacherAssignmentDto> {
    // 1. Verify Section belongs to school AND active academic year
    const section = await this.getSectionById(
      schoolId,
      academicYearId,
      input.academicYearSectionId,
    );

    // 2. If subject provided, verify subject belongs to school
    let subjectName: string | null = null;
    if (input.subjectId) {
      const sub = await this.getSubjectById(schoolId, input.subjectId);
      subjectName = sub.name;
    }

    const isClassTeacher = Boolean(input.isClassTeacher);

    try {
      // Check if active class teacher already exists for this section
      if (isClassTeacher) {
        const existingCT = await prisma.teacherAssignment.findFirst({
          where: {
            schoolId,
            academicYearSectionId: input.academicYearSectionId,
            isClassTeacher: true,
            isActive: true,
          },
        });
        if (existingCT) {
          throw new AppError('This section already has an assigned active Class Teacher', 409, [
            {
              message: 'Only one active Class Teacher allowed per section',
              code: 'CLASS_TEACHER_ALREADY_ASSIGNED',
            },
          ]);
        }
      }

      // Check duplicate assignment
      const duplicate = await prisma.teacherAssignment.findFirst({
        where: {
          schoolId,
          academicYearSectionId: input.academicYearSectionId,
          staffId: input.staffId,
          subjectId: input.subjectId || null,
        },
      });

      if (duplicate) {
        throw new AppError('Teacher assignment already exists for this section and subject', 409, [
          { message: 'Teacher assignment already exists', code: 'DUPLICATE_TEACHER_ASSIGNMENT' },
        ]);
      }

      const created = await prisma.teacherAssignment.create({
        data: {
          schoolId,
          academicYearSectionId: input.academicYearSectionId,
          staffId: input.staffId,
          subjectId: input.subjectId || null,
          isClassTeacher,
          isActive: true,
          classTeacherUniqueKey: isClassTeacher ? `${input.academicYearSectionId}_CT` : null,
        },
        include: {
          section: {
            include: {
              class: { select: { id: true, name: true, code: true } },
            },
          },
          staff: {
            select: { id: true, firstName: true, lastName: true },
          },
          subject: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      return {
        id: created.id,
        schoolId: created.schoolId,
        academicYearSectionId: created.academicYearSectionId,
        sectionName: created.section?.sectionName,
        className: created.section?.class?.name,
        staffId: created.staffId,
        staffName: `${created.staff?.firstName || ''} ${created.staff?.lastName || ''}`.trim(),
        subjectId: created.subjectId,
        subjectName: created.subject?.name,
        isClassTeacher: created.isClassTeacher,
        isActive: created.isActive,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      if (isClassTeacher) {
        const existingCT = fallbackTeacherAssignments.find(
          (a) =>
            a.schoolId === schoolId &&
            a.academicYearSectionId === input.academicYearSectionId &&
            a.isClassTeacher &&
            a.isActive,
        );
        if (existingCT) {
          throw new AppError('This section already has an assigned active Class Teacher', 409, [
            {
              message: 'Only one active Class Teacher allowed per section',
              code: 'CLASS_TEACHER_ALREADY_ASSIGNED',
            },
          ]);
        }
      }

      const duplicate = fallbackTeacherAssignments.find(
        (a) =>
          a.schoolId === schoolId &&
          a.academicYearSectionId === input.academicYearSectionId &&
          a.staffId === input.staffId &&
          (a.subjectId || null) === (input.subjectId || null),
      );
      if (duplicate) {
        throw new AppError('Teacher assignment already exists for this section and subject', 409, [
          { message: 'Teacher assignment already exists', code: 'DUPLICATE_TEACHER_ASSIGNMENT' },
        ]);
      }

      const newAssignment = {
        id: `${getInternalIdPrefix('teacherAssignment')}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        academicYearSectionId: input.academicYearSectionId,
        staffId: input.staffId,
        subjectId: input.subjectId || null,
        isClassTeacher,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackTeacherAssignments.push(newAssignment);

      return {
        ...newAssignment,
        sectionName: section.sectionName,
        className: section.className,
        staffName: 'Staff Member',
        subjectName,
      };
    }
  },

  async deleteAssignment(schoolId: string, academicYearId: string, id: string): Promise<void> {
    try {
      const assignment = await prisma.teacherAssignment.findUnique({
        where: { id },
        include: { section: true },
      });

      if (!assignment) {
        throw new AppError('Teacher assignment not found', 404, [
          { message: 'Assignment does not exist', code: 'ASSIGNMENT_NOT_FOUND' },
        ]);
      }

      if (assignment.schoolId !== schoolId) {
        throw new AppError('Forbidden: Assignment belongs to another school', 403, [
          {
            message: 'Assignment belongs to a different school tenant',
            code: 'ASSIGNMENT_FORBIDDEN',
          },
        ]);
      }

      if (assignment.section?.academicYearId !== academicYearId) {
        throw new AppError('Assignment belongs to a different academic year', 400, [
          { message: 'Academic year mismatch', code: 'ASSIGNMENT_YEAR_MISMATCH' },
        ]);
      }

      await prisma.teacherAssignment.delete({ where: { id } });
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fallback
      const globalMatch = fallbackTeacherAssignments.find((a) => a.id === id);
      if (globalMatch && globalMatch.schoolId !== schoolId) {
        throw new AppError('Forbidden: Assignment belongs to another school', 403, [
          {
            message: 'Assignment belongs to a different school tenant',
            code: 'ASSIGNMENT_FORBIDDEN',
          },
        ]);
      }

      const match = fallbackTeacherAssignments.find((a) => a.id === id && a.schoolId === schoolId);
      if (!match) {
        throw new AppError('Teacher assignment not found', 404, [
          { message: 'Assignment does not exist', code: 'ASSIGNMENT_NOT_FOUND' },
        ]);
      }

      fallbackTeacherAssignments = fallbackTeacherAssignments.filter((a) => a.id !== id);
    }
  },
};

export default academicSetupService;
