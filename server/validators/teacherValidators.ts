import { RequestValidationSchema } from './validate';

export const teacherIdParamSchema: RequestValidationSchema = {
  params: {
    teacherId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid teacher identifier is required',
    },
  },
};

export const createTeacherSchema: RequestValidationSchema = {
  body: {
    firstName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: 'First name is required (max 100 characters)',
    },
    lastName: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    email: {
      required: true,
      type: 'email',
      message: 'A valid email address is required',
    },
    phone: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    mobile: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    gender: {
      required: false,
      type: 'string',
      maxLength: 20,
    },
    dateOfBirth: {
      required: false,
      type: 'string',
      custom: (val) => !val || !isNaN(Date.parse(val)) || 'Date of birth must be a valid date',
    },
    dateOfJoining: {
      required: false,
      type: 'string',
      custom: (val) => !val || !isNaN(Date.parse(val)) || 'Date of joining must be a valid date',
    },
    joiningDate: {
      required: false,
      type: 'string',
      custom: (val) => !val || !isNaN(Date.parse(val)) || 'Joining date must be a valid date',
    },
    employmentType: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    status: {
      required: false,
      type: 'string',
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'RETIRED', 'TERMINATED'],
      message: 'Status must be ACTIVE, INACTIVE, SUSPENDED, RESIGNED, RETIRED, or TERMINATED',
    },
    departmentId: {
      required: false,
      type: 'string',
    },
    designationId: {
      required: false,
      type: 'string',
    },
    bloodGroup: {
      required: false,
      type: 'string',
      maxLength: 10,
    },
  },
};

export const updateTeacherSchema: RequestValidationSchema = {
  params: {
    teacherId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid teacher identifier is required',
    },
  },
  body: {
    firstName: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    lastName: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    email: {
      required: false,
      type: 'email',
    },
    phone: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    mobile: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    gender: {
      required: false,
      type: 'string',
      maxLength: 20,
    },
    dateOfBirth: {
      required: false,
      type: 'string',
      custom: (val) => !val || !isNaN(Date.parse(val)) || 'Date of birth must be a valid date',
    },
    dateOfJoining: {
      required: false,
      type: 'string',
      custom: (val) => !val || !isNaN(Date.parse(val)) || 'Date of joining must be a valid date',
    },
    status: {
      required: false,
      type: 'string',
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'RETIRED', 'TERMINATED'],
    },
  },
};

export const updateTeacherStatusSchema: RequestValidationSchema = {
  params: {
    teacherId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid teacher identifier is required',
    },
  },
  body: {
    status: {
      required: true,
      type: 'string',
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'RETIRED', 'TERMINATED'],
      message: 'Status must be ACTIVE, INACTIVE, SUSPENDED, RESIGNED, RETIRED, or TERMINATED',
    },
    reason: {
      required: false,
      type: 'string',
      maxLength: 500,
    },
  },
};

export const assignmentIdParamSchema: RequestValidationSchema = {
  params: {
    teacherId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid teacher identifier is required',
    },
    assignmentId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid assignment identifier is required',
    },
  },
};

export const assignSubjectSchema: RequestValidationSchema = {
  params: {
    teacherId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid teacher identifier is required',
    },
  },
  body: {
    className: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: 'Class name is required',
    },
    sectionName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      message: 'Section name is required',
    },
    subjectName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: 'Subject name is required',
    },
    periodsPerWeek: {
      required: true,
      type: 'number',
      min: 1,
      max: 40,
      message: 'Periods per week must be between 1 and 40',
    },
  },
};

export const assignClassTeacherSchema: RequestValidationSchema = {
  params: {
    teacherId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid teacher identifier is required',
    },
  },
  body: {
    className: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: 'Class name is required',
    },
    sectionName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      message: 'Section name is required',
    },
  },
};
