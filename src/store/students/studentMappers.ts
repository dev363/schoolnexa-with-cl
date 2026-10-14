/**
 * Student DTO Mappers
 * Maps backend Prisma DTOs to the UI StudentItem model.
 */

import {
  StudentItem,
  StudentStatus,
  Guardian,
  Gender,
  GuardianRelationship,
  AdmissionType,
} from '@/components/pages/students/types';
import { getBusinessPrefix } from '@/config/identifiers';

/**
 * Maps a backend StudentDto or StudentDetailDto to the frontend StudentItem model.
 */
export function mapDtoToStudentItem(dto: any): StudentItem {
  if (!dto) {
    return {} as StudentItem;
  }

  // Map guardians if present (from detailed DTO or direct list)
  let guardians: Guardian[] = [];
  if (Array.isArray(dto.guardians) && dto.guardians.length > 0) {
    guardians = dto.guardians.map((g: any, index: number) => {
      const hasParentObj = g.parent && typeof g.parent === 'object';
      if (hasParentObj) {
        const parentUser = g.parent?.user;
        const fullName = parentUser?.fullName || g.parent?.emergencyContact || '';
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || 'Guardian';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined;
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        let rel: GuardianRelationship = 'Guardian';
        const rawRel = (g.relationship || '').toUpperCase();
        if (rawRel === 'FATHER') rel = 'Father';
        else if (rawRel === 'MOTHER') rel = 'Mother';
        else if (rawRel === 'OTHER') rel = 'Other';

        return {
          id: g.id || `g-${dto.id}-${index}`,
          relationship: rel,
          firstName,
          middleName,
          lastName,
          mobile: g.parent?.primaryPhone || dto.emergencyPhone || '',
          alternateMobile: g.parent?.alternatePhone || undefined,
          email: parentUser?.email || undefined,
          occupation: g.parent?.occupation || undefined,
          address: g.parent?.currentAddress || dto.address || undefined,
          city: dto.city,
          state: dto.state,
          country: 'India',
          postalCode: dto.postalCode,
          isPrimary: Boolean(g.isPrimaryContact ?? g.isPrimary),
          isEmergencyContact: Boolean(g.isEmergencyContact ?? g.isPrimaryContact ?? g.isPrimary),
          isAuthorizedPickup: Boolean(g.canPickup ?? g.isAuthorizedPickup),
        };
      } else {
        // Flat guardian object representation
        let rel: GuardianRelationship = 'Guardian';
        const rawRel = (g.relationship || '').toUpperCase();
        if (rawRel === 'FATHER') rel = 'Father';
        else if (rawRel === 'MOTHER') rel = 'Mother';
        else if (rawRel === 'OTHER') rel = 'Other';

        return {
          id: g.id || `g-${dto.id}-${index}`,
          relationship: rel,
          firstName: g.firstName || 'Guardian',
          middleName: g.middleName || undefined,
          lastName: g.lastName || '',
          gender: g.gender || undefined,
          mobile: g.mobile || g.primaryPhone || dto.emergencyPhone || '',
          alternateMobile: g.alternateMobile || g.alternatePhone || undefined,
          email: g.email || undefined,
          occupation: g.occupation || undefined,
          address: g.address || g.currentAddress || dto.address || undefined,
          city: g.city || dto.city,
          state: g.state || dto.state,
          country: g.country || dto.country || 'India',
          postalCode: g.postalCode || dto.postalCode,
          isPrimary: Boolean(g.isPrimary ?? g.isPrimaryContact),
          isEmergencyContact: Boolean(g.isEmergencyContact ?? g.isPrimaryContact ?? g.isPrimary),
          isAuthorizedPickup: Boolean(g.isAuthorizedPickup ?? g.canPickup),
        };
      }
    });
  } else if (dto.emergencyContact) {
    // Compact representation fallback
    const nameParts = dto.emergencyContact.trim().split(/\s+/);
    guardians = [
      {
        id: `g-${dto.id}-primary`,
        relationship: 'Guardian',
        firstName: nameParts[0] || 'Guardian',
        lastName: nameParts.slice(1).join(' ') || '',
        mobile: dto.emergencyPhone || '',
        isPrimary: true,
        isEmergencyContact: true,
        isAuthorizedPickup: true,
      },
    ];
  }

  const enrollment =
    dto.currentEnrollment ||
    (Array.isArray(dto.enrollments)
      ? dto.enrollments.find((e: any) => e.status === 'ACTIVE') || dto.enrollments[0]
      : null);

  const admissionNo = dto.activeAdmissionNumber || dto.admissionNumber || undefined;
  const hasActiveAdmission = Boolean(dto.activeAdmissionNumber || enrollment);
  const stuPrefix = getBusinessPrefix('studentReference');
  const studentCode =
    admissionNo || dto.identity?.nationalId || `${stuPrefix}${String(dto.id).slice(-6).toUpperCase()}`;

  return {
    id: dto.id,
    studentCode,
    admissionNumber: admissionNo,
    hasActiveAdmission,
    currentClass: enrollment?.className || dto.currentClass || undefined,
    currentSection: enrollment?.sectionName || dto.currentSection || undefined,
    className: enrollment?.className || dto.className || undefined,
    sectionName: enrollment?.sectionName || dto.sectionName || undefined,
    academicYear: enrollment?.academicYearName || dto.academicYear || undefined,
    rollNumber:
      enrollment?.rollNumber !== null && enrollment?.rollNumber !== undefined
        ? String(enrollment.rollNumber)
        : undefined,

    firstName: dto.firstName || '',
    middleName: dto.middleName || '',
    lastName: dto.lastName || '',
    photoUrl: dto.photoUrl || '',

    dateOfBirth: dto.dateOfBirth ? String(dto.dateOfBirth).split('T')[0] : '',
    gender: (dto.gender as Gender) || 'OTHER',
    bloodGroup: dto.bloodGroup || undefined,
    specialCategory: dto.specialCategory || 'N',
    specialCategoryDetails: dto.specialCategoryDetails || undefined,
    nationality: dto.nationality || dto.identity?.nationality || 'Indian',
    religion: dto.religion || undefined,
    category: dto.category || undefined,
    motherTongue: dto.motherTongue || undefined,
    placeOfBirth: dto.placeOfBirth || dto.identity?.countryOfBirth || undefined,

    governmentId: dto.governmentId || dto.identity?.nationalId || undefined,

    mobile: dto.mobile || dto.emergencyPhone || '',
    alternateMobile: dto.alternateMobile || undefined,
    email: dto.email || dto.guardians?.[0]?.parent?.user?.email || '',
    emergencyContact: dto.emergencyContact || undefined,
    emergencyPhone: dto.emergencyPhone || undefined,

    addressLine1: dto.addressLine1 || dto.address || '',
    addressLine2: dto.addressLine2 || '',
    city: dto.city || '',
    state: dto.state || '',
    country: dto.country || 'India',
    postalCode: dto.postalCode || '',

    guardians,

    previousSchool: dto.previousSchool || undefined,
    previousClass: dto.previousClass || undefined,
    previousSchoolBoard: dto.previousSchoolBoard || undefined,
    transferCertificateNumber:
      dto.transferCertificateNumber ||
      dto.transferCertificates?.[0]?.certificateNumber ||
      undefined,
    transferCertificateDate: dto.transferCertificateDate
      ? String(dto.transferCertificateDate).split('T')[0]
      : dto.transferCertificates?.[0]?.issueDate
        ? String(dto.transferCertificates[0].issueDate).split('T')[0]
        : undefined,

    notes: dto.notes || undefined,
    status: (dto.status as StudentStatus) || 'ACTIVE',
    createdAt: dto.createdAt || new Date().toISOString(),
    admissionDate:
      dto.admissionDate || (dto.createdAt ? String(dto.createdAt).split('T')[0] : undefined),
    admissionType: (dto.admissionType as AdmissionType) || 'REGULAR',
  };
}
