import { RequestValidationSchema } from './validate';

export const studentIdParamSchema: RequestValidationSchema = {
  params: {
    studentId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid student ID is required',
    },
  },
};

export const createStudentSchema: RequestValidationSchema = {
  body: {
    admissionNumber: {
      required: false,
      type: 'string',
      maxLength: 64,
    },
    registrationId: {
      required: false,
      type: 'string',
      maxLength: 64,
    },
    firstName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: 'First name is required (max 100 characters)',
    },
    middleName: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    lastName: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    photoUrl: {
      required: false,
      type: 'string',
      maxLength: 500,
    },
    gender: {
      required: true,
      type: 'string',
      enum: ['MALE', 'FEMALE', 'OTHER'],
      message: 'Gender must be MALE, FEMALE, or OTHER',
    },
    dateOfBirth: {
      required: true,
      type: 'string',
      custom: (val) => !isNaN(Date.parse(val)) || 'Date of birth must be a valid date (YYYY-MM-DD)',
      message: 'Valid date of birth is required',
    },
    bloodGroup: {
      required: false,
      type: 'string',
      maxLength: 10,
    },
    specialCategory: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    specialCategoryDetails: {
      required: false,
      type: 'string',
    },
    religion: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    category: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    motherTongue: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    placeOfBirth: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    governmentId: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    mobile: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    alternateMobile: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    email: {
      required: false,
      type: 'string',
      maxLength: 191,
    },
    address: {
      required: false,
      type: 'string',
    },
    addressLine1: {
      required: false,
      type: 'string',
      maxLength: 255,
    },
    addressLine2: {
      required: false,
      type: 'string',
      maxLength: 255,
    },
    city: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    state: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    country: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    postalCode: {
      required: false,
      type: 'string',
      maxLength: 20,
    },
    previousSchool: {
      required: false,
      type: 'string',
      maxLength: 200,
    },
    previousClass: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    previousSchoolBoard: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    transferCertificateNumber: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    transferCertificateDate: {
      required: false,
      type: 'string',
    },
    notes: {
      required: false,
      type: 'string',
    },
    status: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    emergencyContact: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    emergencyPhone: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    nationalId: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    idType: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    birthCertNo: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    nationality: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    countryOfBirth: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    guardians: {
      required: false,
      type: 'array',
    },
  },
};

export const updateStudentSchema: RequestValidationSchema = {
  params: {
    studentId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid student ID is required',
    },
  },
  body: {
    admissionNumber: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 64,
    },
    registrationId: {
      required: false,
      type: 'string',
      maxLength: 64,
    },
    firstName: {
      required: false,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    middleName: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    lastName: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    photoUrl: {
      required: false,
      type: 'string',
      maxLength: 500,
    },
    gender: {
      required: false,
      type: 'string',
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    dateOfBirth: {
      required: false,
      type: 'string',
      custom: (val) => !isNaN(Date.parse(val)) || 'Date of birth must be a valid date (YYYY-MM-DD)',
    },
    bloodGroup: {
      required: false,
      type: 'string',
      maxLength: 10,
    },
    specialCategory: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    specialCategoryDetails: {
      required: false,
      type: 'string',
    },
    religion: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    category: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    motherTongue: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    placeOfBirth: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    governmentId: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    mobile: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    alternateMobile: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    email: {
      required: false,
      type: 'string',
      maxLength: 191,
    },
    address: {
      required: false,
      type: 'string',
    },
    addressLine1: {
      required: false,
      type: 'string',
      maxLength: 255,
    },
    addressLine2: {
      required: false,
      type: 'string',
      maxLength: 255,
    },
    city: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    state: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    country: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    postalCode: {
      required: false,
      type: 'string',
      maxLength: 20,
    },
    previousSchool: {
      required: false,
      type: 'string',
      maxLength: 200,
    },
    previousClass: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    previousSchoolBoard: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    transferCertificateNumber: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    transferCertificateDate: {
      required: false,
      type: 'string',
    },
    notes: {
      required: false,
      type: 'string',
    },
    status: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    emergencyContact: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    emergencyPhone: {
      required: false,
      type: 'string',
      maxLength: 30,
    },
    nationalId: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    idType: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    birthCertNo: {
      required: false,
      type: 'string',
      maxLength: 100,
    },
    nationality: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    countryOfBirth: {
      required: false,
      type: 'string',
      maxLength: 50,
    },
    guardians: {
      required: false,
      type: 'array',
    },
  },
};

export const updateStudentStatusSchema: RequestValidationSchema = {
  params: {
    studentId: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Valid student ID is required',
    },
  },
  body: {
    status: {
      required: true,
      type: 'string',
      enum: ['ACTIVE', 'INACTIVE'],
      message: 'Status must be either ACTIVE or INACTIVE',
    },
    reason: {
      required: false,
      type: 'string',
      maxLength: 255,
    },
  },
};
