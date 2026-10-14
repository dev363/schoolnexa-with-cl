import { FieldDefinitionMap, ListConfig } from '../utils/listQueryHelper';

/**
 * Safe, supported field definitions for Teacher / Faculty (Prisma Staff model).
 * Automatically maps API field aliases to Prisma model attributes and relation paths.
 * Prevents arbitrary database access or injection.
 */
export const TEACHER_FIELD_DEFINITIONS: FieldDefinitionMap = {
  // Primary identifier & code
  id: { prismaField: 'id', type: 'string', filterable: true, sortable: true, searchable: false },
  teacherId: { prismaField: 'employeeCode', type: 'string', filterable: true, sortable: true, searchable: true },
  employeeCode: { prismaField: 'employeeCode', type: 'string', filterable: true, sortable: true, searchable: true },
  teacherCode: { prismaField: 'employeeCode', type: 'string', filterable: true, sortable: true, searchable: true },

  // Personal demographics
  firstName: { prismaField: 'firstName', type: 'string', filterable: true, sortable: true, searchable: true },
  lastName: { prismaField: 'lastName', type: 'string', filterable: true, sortable: true, searchable: true },
  name: { prismaField: 'firstName', type: 'string', filterable: true, sortable: true, searchable: true },
  gender: { prismaField: 'gender', type: 'string', filterable: true, sortable: true, searchable: false },
  bloodGroup: { prismaField: 'bloodGroup', type: 'string', filterable: true, sortable: true, searchable: false },
  dateOfBirth: { prismaField: 'dateOfBirth', type: 'date', filterable: true, sortable: true, searchable: false },

  // Contact details
  email: { prismaField: 'email', type: 'string', filterable: true, sortable: true, searchable: true },
  phone: { prismaField: 'phone', type: 'string', filterable: true, sortable: true, searchable: true },
  mobile: { prismaField: 'phone', type: 'string', filterable: true, sortable: true, searchable: true },
  city: { prismaField: 'city', type: 'string', filterable: true, sortable: true, searchable: true },
  state: { prismaField: 'state', type: 'string', filterable: true, sortable: true, searchable: true },
  postalCode: { prismaField: 'postalCode', type: 'string', filterable: true, sortable: true, searchable: false },

  // Employment & Status
  status: { prismaField: 'status', type: 'string', filterable: true, sortable: true, searchable: false },
  employmentType: { prismaField: 'employmentType', type: 'string', filterable: true, sortable: true, searchable: false },
  qualification: { prismaField: 'qualification', type: 'string', filterable: true, sortable: true, searchable: true },
  dateOfJoining: { prismaField: 'dateOfJoining', type: 'date', filterable: true, sortable: true, searchable: false },
  joiningDate: { prismaField: 'dateOfJoining', type: 'date', filterable: true, sortable: true, searchable: false },

  // Relational mappings (department and designation)
  departmentId: { prismaField: 'departmentId', type: 'string', filterable: true, sortable: true, searchable: false },
  designationId: { prismaField: 'designationId', type: 'string', filterable: true, sortable: true, searchable: false },
  departmentName: {
    prismaField: 'name',
    relationPath: ['department'],
    type: 'string',
    filterable: true,
    sortable: true,
    searchable: true,
  },
  designationName: {
    prismaField: 'title',
    relationPath: ['designation'],
    type: 'string',
    filterable: true,
    sortable: true,
    searchable: true,
  },

  // Timestamps
  createdAt: { prismaField: 'createdAt', type: 'date', filterable: true, sortable: true, searchable: false },
  updatedAt: { prismaField: 'updatedAt', type: 'date', filterable: true, sortable: true, searchable: false },
};

/**
 * Standard Teacher module list configuration.
 *
 * Rules:
 * - If an array contains values: operation is restricted to those columns.
 * - If an array is [] or omitted: operation applies across ALL safe supported columns.
 */
export const TEACHER_LIST_CONFIG: ListConfig = {
  searchableColumns: [
    'employeeCode',
    'firstName',
    'lastName',
    'email',
    'phone',
    'qualification',
    'city',
  ],
  filterableColumns: [
    'status',
    'employmentType',
    'departmentId',
    'designationId',
    'gender',
    'bloodGroup',
    'dateOfJoining',
    'city',
    'state',
  ],
  sortableColumns: [
    'firstName',
    'lastName',
    'employeeCode',
    'email',
    'status',
    'dateOfJoining',
    'createdAt',
  ],
  defaultOrder: [
    {
      orderTo: 'createdAt',
      orderBy: 'desc',
    },
  ],
  defaultPageSize: 25,
  maxPageSize: 100,
};
