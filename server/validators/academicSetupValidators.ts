import { RequestValidationSchema } from './validate';

export const idParamSchema: RequestValidationSchema = {
  params: {
    id: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid resource ID parameter is required',
    },
  },
};

// ==========================================
// CLASS VALIDATORS
// ==========================================

export const createClassSchema: RequestValidationSchema = {
  body: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: 'Class name is required (max 100 characters)',
    },
    code: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      message: 'Class code is required (max 50 characters)',
    },
    numericOrder: {
      required: true,
      type: 'number',
      min: 0,
      max: 100,
      message: 'Numeric order is required (0-100)',
    },
    stream: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
  },
};

export const updateClassSchema: RequestValidationSchema = {
  params: {
    id: {
      required: true,
      type: 'string',
      minLength: 1,
    },
  },
  body: {
    name: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    code: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    numericOrder: {
      required: false,
      type: 'number',
      min: 0,
      max: 100,
    },
    stream: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
  },
};

// ==========================================
// SECTION VALIDATORS
// ==========================================

export const createSectionSchema: RequestValidationSchema = {
  body: {
    classId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Class ID is required',
    },
    sectionName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 20,
      message: 'Section name is required (e.g. A, B, Rose)',
    },
    maxCapacity: {
      required: false,
      type: 'number',
      min: 1,
      max: 200,
      message: 'Maximum capacity must be between 1 and 200',
    },
  },
};

export const updateSectionSchema: RequestValidationSchema = {
  params: {
    id: {
      required: true,
      type: 'string',
      minLength: 1,
    },
  },
  body: {
    sectionName: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 20,
    },
    maxCapacity: {
      required: false,
      type: 'number',
      min: 1,
      max: 200,
    },
  },
};

// ==========================================
// SUBJECT VALIDATORS
// ==========================================

export const createSubjectSchema: RequestValidationSchema = {
  body: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: 'Subject name is required',
    },
    code: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      message: 'Subject code is required',
    },
    subjectType: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    credits: {
      required: false,
      type: 'number',
      min: 0,
      max: 50,
    },
    isElective: {
      required: false,
      type: 'boolean',
    },
  },
};

export const updateSubjectSchema: RequestValidationSchema = {
  params: {
    id: {
      required: true,
      type: 'string',
      minLength: 1,
    },
  },
  body: {
    name: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    code: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    subjectType: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    credits: {
      required: false,
      type: 'number',
      min: 0,
      max: 50,
    },
    isElective: {
      required: false,
      type: 'boolean',
    },
  },
};

// ==========================================
// CURRICULUM (CLASS-SUBJECT) VALIDATORS
// ==========================================

export const createCurriculumSchema: RequestValidationSchema = {
  body: {
    classId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Class ID is required',
    },
    subjectId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Subject ID is required',
    },
    academicYearId: {
      required: false,
      type: 'string',
    },
    syllabusName: {
      required: false,
      type: 'string',
      maxLength: 200,
    },
    syllabusId: {
      required: false,
      type: 'string',
    },
    isMandatory: {
      required: false,
      type: 'boolean',
    },
    weeklyPeriods: {
      required: false,
      type: 'number',
      min: 1,
      max: 50,
    },
  },
};

export const updateCurriculumSchema: RequestValidationSchema = {
  params: {
    id: {
      required: true,
      type: 'string',
      minLength: 1,
    },
  },
  body: {
    academicYearId: {
      required: false,
      type: 'string',
      maxLength: 36,
    },
    syllabusName: {
      required: false,
      type: 'string',
      maxLength: 200,
    },
    isMandatory: {
      required: false,
      type: 'boolean',
    },
    weeklyPeriods: {
      required: false,
      type: 'number',
      min: 1,
      max: 50,
    },
  },
};

export const bulkCurriculumSchema: RequestValidationSchema = {
  body: {
    classId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Target class ID is required',
    },
    subjectIds: {
      required: true,
      type: 'array',
      message: 'List of subject IDs is required',
    },
    academicYearId: {
      required: false,
      type: 'string',
    },
    syllabusName: {
      required: false,
      type: 'string',
      maxLength: 200,
    },
    isMandatory: {
      required: false,
      type: 'boolean',
    },
    weeklyPeriods: {
      required: false,
      type: 'number',
      min: 1,
      max: 50,
    },
  },
};

// ==========================================
// TEACHER ASSIGNMENT VALIDATORS
// ==========================================

export const createTeacherAssignmentSchema: RequestValidationSchema = {
  body: {
    academicYearSectionId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Academic year section ID is required',
    },
    staffId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Staff ID is required',
    },
    subjectId: {
      required: false,
      type: 'string',
    },
    isClassTeacher: {
      required: false,
      type: 'boolean',
    },
  },
};

export const updateTeacherAssignmentSchema: RequestValidationSchema = {
  params: {
    id: {
      required: true,
      type: 'string',
      minLength: 1,
    },
  },
  body: {
    isActive: {
      required: false,
      type: 'boolean',
    },
    isClassTeacher: {
      required: false,
      type: 'boolean',
    },
  },
};
