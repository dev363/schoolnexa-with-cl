export interface ClassDto {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  numericOrder: number;
  stream: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  sectionsCount?: number;
  subjectsCount?: number;
}

export interface CreateClassInput {
  name: string;
  code: string;
  numericOrder: number;
  stream?: string | null;
}

export interface UpdateClassInput {
  name?: string;
  code?: string;
  numericOrder?: number;
  stream?: string | null;
}

export interface SectionDto {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  className?: string;
  classCode?: string;
  sectionName: string;
  maxCapacity: number;
  currentCount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateSectionInput {
  classId: string;
  sectionName: string;
  maxCapacity?: number;
}

export interface UpdateSectionInput {
  sectionName?: string;
  maxCapacity?: number;
}

export interface SubjectDto {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  subjectType: string;
  credits: number;
  isElective: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateSubjectInput {
  name: string;
  code: string;
  subjectType?: string;
  credits?: number;
  isElective?: boolean;
}

export interface UpdateSubjectInput {
  name?: string;
  code?: string;
  subjectType?: string;
  credits?: number;
  isElective?: boolean;
}

export interface ClassSubjectDto {
  id: string;
  schoolId: string;
  academicYearId?: string;
  academicYearName?: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  syllabusId?: string;
  syllabusName?: string;
  isMandatory: boolean;
  weeklyPeriods: number;
  createdAt?: string | Date;
}

export interface CreateClassSubjectInput {
  academicYearId?: string;
  classId: string;
  subjectId: string;
  syllabusId?: string;
  syllabusName?: string;
  isMandatory?: boolean;
  weeklyPeriods?: number;
}

export interface UpdateClassSubjectInput {
  academicYearId?: string;
  syllabusName?: string;
  isMandatory?: boolean;
  weeklyPeriods?: number;
}

export interface BulkCurriculumMappingInput {
  academicYearId?: string;
  classId: string;
  subjectIds: string[];
  syllabusName?: string;
  isMandatory?: boolean;
  weeklyPeriods?: number;
}

export interface TeacherAssignmentDto {
  id: string;
  schoolId: string;
  academicYearSectionId: string;
  sectionName?: string;
  className?: string;
  staffId: string;
  staffName?: string;
  subjectId: string | null;
  subjectName?: string | null;
  isClassTeacher: boolean;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateTeacherAssignmentInput {
  academicYearSectionId: string;
  staffId: string;
  subjectId?: string | null;
  isClassTeacher?: boolean;
}

export interface UpdateTeacherAssignmentInput {
  isActive?: boolean;
  isClassTeacher?: boolean;
}
