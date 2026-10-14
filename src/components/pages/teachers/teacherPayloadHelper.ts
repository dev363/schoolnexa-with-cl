/**
 * Teacher Payload Sanitization & Preparation Helpers
 *
 * Provides safe string handling and object normalization for Teacher
 * mutations to prevent unsafe .trim() errors on undefined/null values.
 */

import type { TeacherFormState } from '@/components/pages/teachers/teacherFormTypes';
import type { CreateTeacherRequest, UpdateTeacherRequest } from '@/store/teachers/types';

/**
 * Safely trims an unknown or optional string, returning an empty string if undefined/null.
 */
export function safeTrim(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return String(value).trim();
  return value.trim();
}

/**
 * Safely trims an optional string, returning undefined if empty, null, or undefined.
 */
export function safeOptionalTrim(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = typeof value === 'string' ? value.trim() : String(value).trim();
  return str.length > 0 ? str : undefined;
}

/**
 * Prepares and normalizes the payload for CreateTeacher mutation.
 */
export function buildCreateTeacherPayload(state: TeacherFormState): CreateTeacherRequest {
  const firstName = safeTrim(state.firstName);
  const lastName = safeTrim(state.lastName);
  const preferredName = safeOptionalTrim(state.preferredName) || `${firstName} ${lastName}`.trim();

  return {
    ...(state.teacherId && state.teacherId !== 'TCH-AUTO'
      ? { teacherId: safeTrim(state.teacherId) }
      : {}),
    firstName,
    middleName: safeOptionalTrim(state.middleName),
    lastName,
    preferredName,
    gender: state.gender || 'Male',
    dateOfBirth: state.dateOfBirth || '1990-01-01',
    profilePhoto: safeOptionalTrim(state.profilePhoto),
    nationality: safeOptionalTrim(state.nationality) || 'Indian',
    maritalStatus: state.maritalStatus || 'Married',
    bloodGroup: state.bloodGroup || 'O+',
    mobile: safeTrim(state.mobile),
    alternateMobile: safeOptionalTrim(state.alternateMobile),
    email: safeTrim(state.email),
    alternateEmail: safeOptionalTrim(state.alternateEmail),
    currentAddress: state.currentAddress,
    permanentAddress: state.permanentAddress,
    designationName: state.designationName,
    departmentName: state.departmentName,
    employmentType: state.employmentType || 'FULL_TIME',
    joiningDate: state.joiningDate || new Date().toISOString().split('T')[0],
    confirmationDate: safeOptionalTrim(state.confirmationDate),
    status: state.status || 'ACTIVE',
    workLocation: safeOptionalTrim(state.workLocation),
    reportingTeacherId: safeOptionalTrim(state.reportingTeacherId),
    qualifications: state.qualifications || [],
    experiences: state.experiences || [],
    emergencyContacts: state.emergencyContacts || [],
    documents: state.documents || [],
    languages: state.languages || ['English', 'Hindi'],
    specialSkills: state.specialSkills || [],
    notes: safeOptionalTrim(state.notes),
    remarks: safeOptionalTrim(state.remarks),
  };
}

/**
 * Prepares and normalizes the payload for UpdateTeacher mutation.
 */
export function buildUpdateTeacherPayload(state: TeacherFormState): UpdateTeacherRequest {
  const firstName = safeTrim(state.firstName);
  const lastName = safeTrim(state.lastName);
  const preferredName = safeOptionalTrim(state.preferredName) || `${firstName} ${lastName}`.trim();

  return {
    teacherId: safeTrim(state.teacherId),
    firstName,
    middleName: safeOptionalTrim(state.middleName),
    lastName,
    preferredName,
    gender: state.gender,
    dateOfBirth: state.dateOfBirth,
    profilePhoto: safeOptionalTrim(state.profilePhoto),
    nationality: safeOptionalTrim(state.nationality),
    maritalStatus: state.maritalStatus,
    bloodGroup: state.bloodGroup,
    mobile: safeTrim(state.mobile),
    alternateMobile: safeOptionalTrim(state.alternateMobile),
    email: safeTrim(state.email),
    alternateEmail: safeOptionalTrim(state.alternateEmail),
    currentAddress: state.currentAddress,
    permanentAddress: state.permanentAddress,
    designationName: state.designationName,
    departmentName: state.departmentName,
    employmentType: state.employmentType,
    joiningDate: state.joiningDate,
    confirmationDate: safeOptionalTrim(state.confirmationDate),
    status: state.status,
    workLocation: safeOptionalTrim(state.workLocation),
    reportingTeacherId: safeOptionalTrim(state.reportingTeacherId),
    qualifications: state.qualifications || [],
    experiences: state.experiences || [],
    emergencyContacts: state.emergencyContacts || [],
    documents: state.documents || [],
    languages: state.languages || [],
    specialSkills: state.specialSkills || [],
    notes: safeOptionalTrim(state.notes),
    remarks: safeOptionalTrim(state.remarks),
  };
}
