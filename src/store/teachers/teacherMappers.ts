import {
  Teacher,
  Address,
  TeacherQualification,
  TeacherExperience,
  EmergencyContact,
  TeacherDocument,
  EmploymentType,
  TeacherStatus,
} from '@/components/pages/teachers/types';

export function mapDtoToTeacher(dto: any): Teacher {
  const details =
    typeof dto.details === 'string' ? JSON.parse(dto.details || '{}') : dto.details || {};

  const currentAddress: Address = dto.currentAddress ||
    details.currentAddress || {
      addressLine1: dto.address || '',
      city: dto.city || '',
      state: dto.state || '',
      postalCode: dto.postalCode || '',
      country: 'India',
    };

  const permanentAddress: Address = dto.permanentAddress ||
    details.permanentAddress || { ...currentAddress };

  const qualifications: TeacherQualification[] =
    Array.isArray(dto.qualifications) && dto.qualifications.length > 0
      ? dto.qualifications.map((q: any, i: number) => ({
          id: q.id || `q-${dto.id}-${i}`,
          degree: q.degree || '',
          specialization: q.specialization || q.fieldOfStudy || '',
          institution: q.institution || '',
          university: q.university || '',
          year: q.year || q.yearOfPassing ? Number(q.year || q.yearOfPassing) : undefined,
          grade: q.grade || q.percentageOrGrade || '',
        }))
      : details.qualifications || [];

  const experiences: TeacherExperience[] =
    Array.isArray(dto.experiences) && dto.experiences.length > 0
      ? dto.experiences.map((e: any, i: number) => ({
          id: e.id || `exp-${dto.id}-${i}`,
          organization: e.organization || '',
          designation: e.designation || '',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          description: e.description || '',
        }))
      : details.experiences || [];

  const emergencyContacts: EmergencyContact[] =
    Array.isArray(dto.emergencyContacts) && dto.emergencyContacts.length > 0
      ? dto.emergencyContacts.map((ec: any, i: number) => ({
          id: ec.id || `ec-${dto.id}-${i}`,
          name: ec.name || '',
          relationship: ec.relationship || '',
          mobile: ec.mobile || '',
          alternateMobile: ec.alternateMobile || '',
          email: ec.email || '',
          address: ec.address || '',
          isPrimary: Boolean(ec.isPrimary ?? i === 0),
        }))
      : dto.emergencyContactName
        ? [
            {
              id: `ec-${dto.id}-1`,
              name: dto.emergencyContactName,
              relationship: 'Emergency Contact',
              mobile: dto.emergencyContactPhone || '',
              isPrimary: true,
            },
          ]
        : details.emergencyContacts || [];

  const documents: TeacherDocument[] = Array.isArray(dto.documents)
    ? dto.documents.map((d: any, i: number) => ({
        id: d.id || `doc-${dto.id}-${i}`,
        name: d.name || d.type || 'Document',
        type: d.type || 'OTHER',
        uploadDate: d.uploadDate || '',
        status: d.status || 'VERIFIED',
        fileSize: d.fileSize || '1.2 MB',
        fileUrl: d.fileUrl || '',
      }))
    : [];

  return {
    id: dto.id,
    teacherId: dto.teacherId || dto.employeeCode,
    firstName: dto.firstName || '',
    middleName: dto.middleName || details.middleName || '',
    lastName: dto.lastName || '',
    preferredName:
      dto.preferredName || details.preferredName || `${dto.firstName} ${dto.lastName}`.trim(),
    gender: dto.gender || 'Male',
    dateOfBirth: dto.dateOfBirth || '',
    profilePhoto: dto.profilePhoto || undefined,
    mobile: dto.mobile || dto.phone || '',
    alternateMobile: dto.alternateMobile || details.alternateMobile || undefined,
    email: dto.email || '',
    alternateEmail: dto.alternateEmail || details.alternateEmail || undefined,
    nationality: dto.nationality || details.nationality || 'Indian',
    maritalStatus: dto.maritalStatus || details.maritalStatus || 'Married',
    bloodGroup: dto.bloodGroup || details.bloodGroup || undefined,
    currentAddress,
    permanentAddress,
    departmentId: dto.departmentId || undefined,
    departmentName: dto.departmentName || dto.department?.name || undefined,
    designationId: dto.designationId || undefined,
    designationName: dto.designationName || dto.designation?.title || undefined,
    employmentType: (dto.employmentType as EmploymentType) || 'FULL_TIME',
    joiningDate: dto.joiningDate || dto.dateOfJoining || '',
    confirmationDate: dto.confirmationDate || details.confirmationDate || undefined,
    status: (dto.status as TeacherStatus) || (dto.deletedAt ? 'INACTIVE' : 'ACTIVE'),
    workLocation: dto.workLocation || details.workLocation || undefined,
    reportingTeacherId: dto.reportingTeacherId || details.reportingTeacherId || undefined,
    reportingTeacherName: dto.reportingTeacherName || details.reportingTeacherName || undefined,
    qualifications,
    experiences,
    emergencyContacts,
    documents,
    languages: dto.languages || details.languages || ['English'],
    specialSkills: dto.specialSkills || details.specialSkills || [],
    notes: dto.notes || details.notes || '',
    remarks: dto.remarks || details.remarks || '',
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
  };
}
