import { Request, Response } from 'express';
import { teacherService } from '../services/teacherService';
import { parsePagination } from '../utils/pagination';
import { parseSearch, parseSort } from '../utils/query';
import { sendSuccess, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

const ALLOWED_SORT_FIELDS = [
  'firstName',
  'lastName',
  'employeeCode',
  'createdAt',
  'dateOfJoining',
] as const;

export const teacherController = {
  /**
   * GET /api/teachers
   * List teachers with filtering, search, sorting, and pagination.
   */
  listTeachers: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const pagination = parsePagination(req.query);
    const search = parseSearch(req.query);
    const sort = parseSort(req.query, ALLOWED_SORT_FIELDS, 'createdAt', 'desc');

    const result = await teacherService.listTeachers(schoolId, pagination, {
      search,
      status: req.query.status as string,
      employmentType: req.query.employmentType as string,
      departmentId: (req.query.departmentId || req.query.departmentName) as string,
      departmentName: req.query.departmentName as string,
      designationId: (req.query.designationId || req.query.designationName) as string,
      designationName: req.query.designationName as string,
      gender: req.query.gender as string,
      academicYearId: (req.query.academicYearId as string) || req.academicYearId,
      sortBy: sort.field,
      sortOrder: sort.direction,
    });

    return sendPaginated(res, result.data, result.meta);
  }),

  /**
   * POST /api/teachers/page
   * Standardized pagination, filtering, search, and sorting endpoint.
   * Body: ListPageRequest { page, pageSize, order, filter, search }
   */
  getTeachersPage: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const requestBody = req.body || {};
    const result = await teacherService.getTeachersPage(schoolId, requestBody);
    return res.status(200).json(result);
  }),

  /**
   * GET /api/teachers/metadata
   * Retrieve active departments and designations for teacher management forms.
   */
  getTeacherMetadata: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const metadata = await teacherService.getTeacherMetadata(schoolId);
    return sendSuccess(res, metadata);
  }),

  /**
   * GET /api/teachers/next-id
   * Generate next auto-incremented permanent teacher employee code.
   */
  getNextTeacherId: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const nextTeacherId = await teacherService.generateNextTeacherId(schoolId);
    return sendSuccess(res, { nextTeacherId, nextId: nextTeacherId });
  }),

  /**
   * GET /api/teachers/:teacherId
   * Retrieve full details of a specific teacher profile (including assignments & timetable).
   */
  getTeacherById: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const teacher = await teacherService.getTeacherById(schoolId, teacherId);
    return sendSuccess(res, teacher);
  }),

  /**
   * POST /api/teachers
   * Register a new teacher master record.
   */
  createTeacher: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const created = await teacherService.createTeacher(schoolId, req.body);
    return sendSuccess(res, created, 'Teacher registered successfully', 201);
  }),

  /**
   * POST /api/teachers/import
   * Batch import multiple teacher master profiles.
   */
  importTeachers: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const teachersList = Array.isArray(req.body.teachers)
      ? req.body.teachers
      : Array.isArray(req.body)
        ? req.body
        : [];
    const result = await teacherService.importTeachers(schoolId, teachersList);
    return sendSuccess(
      res,
      result,
      `Successfully imported ${result.imported.length} teachers`,
      201,
    );
  }),

  /**
   * PUT /api/teachers/:teacherId
   * Update teacher master record.
   */
  updateTeacher: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const updated = await teacherService.updateTeacher(schoolId, teacherId, req.body);
    return sendSuccess(res, updated, 'Teacher profile updated successfully');
  }),

  /**
   * PATCH /api/teachers/:teacherId/status
   * Activate, deactivate, suspend or archive a teacher record.
   */
  updateTeacherStatus: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const updated = await teacherService.updateTeacherStatus(schoolId, teacherId, req.body);
    return sendSuccess(res, updated, `Teacher status updated to ${req.body.status}`);
  }),

  /**
   * DELETE /api/teachers/:teacherId
   * Soft-deactivate teacher record safely preserving academic integrity.
   */
  deleteTeacher: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const result = await teacherService.deleteTeacher(schoolId, teacherId);
    return sendSuccess(res, result, 'Teacher deactivated successfully');
  }),

  /**
   * GET /api/teachers/:teacherId/workload
   * Get weekly workload, period load analysis and distribution for an individual teacher.
   */
  getTeacherWorkload: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const workload = await teacherService.getTeacherWorkload(schoolId, teacherId);
    return sendSuccess(res, workload);
  }),

  /**
   * GET /api/teachers/:teacherId/timetable
   * Retrieve weekly teaching timetable grid, period slots, and substitution availability
   */
  getTeacherTimetable: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const timetable = await teacherService.getTeacherTimetable(schoolId, teacherId);
    return sendSuccess(res, timetable, 'Teacher timetable retrieved successfully');
  }),

  /**
   * GET /api/teachers/workload/summary
   * Aggregate workload distribution across all faculty members in the school tenant.
   */
  getWorkloadSummary: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const summary = await teacherService.getWorkloadSummary(schoolId);
    return sendSuccess(res, summary);
  }),

  /**
   * POST /api/teachers/:teacherId/assignments/subjects
   * Assign a subject teaching load to a teacher.
   */
  assignSubject: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const assignment = await teacherService.assignSubject(schoolId, teacherId, req.body);
    return sendSuccess(res, assignment, 'Subject assigned successfully', 201);
  }),

  /**
   * DELETE /api/teachers/:teacherId/assignments/subjects/:assignmentId
   * Relieve/remove a subject teaching assignment.
   */
  removeSubjectAssignment: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId, assignmentId } = req.params;

    const result = await teacherService.removeSubjectAssignment(schoolId, teacherId, assignmentId);
    return sendSuccess(res, result, 'Subject assignment removed successfully');
  }),

  /**
   * POST /api/teachers/:teacherId/assignments/class-teacher
   * Designate or transfer Class Teacher responsibilities.
   */
  assignClassTeacher: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;

    const assignment = await teacherService.assignClassTeacher(schoolId, teacherId, req.body);
    return sendSuccess(res, assignment, 'Class Teacher assigned successfully', 201);
  }),

  /**
   * DELETE /api/teachers/:teacherId/assignments/class-teacher/:assignmentId
   * Relieve Class Teacher designation.
   */
  removeClassTeacherAssignment: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId, assignmentId } = req.params;

    const result = await teacherService.removeClassTeacherAssignment(
      schoolId,
      teacherId,
      assignmentId,
    );
    return sendSuccess(res, result, 'Class Teacher assignment removed successfully');
  }),

  /**
   * GET /api/teachers/:teacherId/qualifications
   */
  getTeacherQualifications: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const qualifications = await teacherService.getTeacherQualifications(schoolId, teacherId);
    return sendSuccess(res, qualifications);
  }),

  /**
   * POST /api/teachers/:teacherId/qualifications
   */
  addTeacherQualification: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const created = await teacherService.addTeacherQualification(schoolId, teacherId, req.body);
    return sendSuccess(res, created, 'Qualification added successfully', 201);
  }),

  /**
   * PUT /api/teachers/:teacherId/qualifications/:qualificationId
   */
  updateTeacherQualification: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId, qualificationId } = req.params;
    const updated = await teacherService.updateTeacherQualification(
      schoolId,
      teacherId,
      qualificationId,
      req.body,
    );
    return sendSuccess(res, updated, 'Qualification updated successfully');
  }),

  /**
   * DELETE /api/teachers/:teacherId/qualifications/:qualificationId
   */
  deleteTeacherQualification: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId, qualificationId } = req.params;
    const result = await teacherService.deleteTeacherQualification(
      schoolId,
      teacherId,
      qualificationId,
    );
    return sendSuccess(res, result, 'Qualification deleted successfully');
  }),

  /**
   * GET /api/teachers/:teacherId/experience
   */
  getTeacherExperience: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const experiences = await teacherService.getTeacherExperience(schoolId, teacherId);
    return sendSuccess(res, experiences);
  }),

  /**
   * POST /api/teachers/:teacherId/experience
   */
  addTeacherExperience: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const created = await teacherService.addTeacherExperience(schoolId, teacherId, req.body);
    return sendSuccess(res, created, 'Experience record added successfully', 201);
  }),

  /**
   * PUT /api/teachers/:teacherId/experience/:experienceId
   */
  updateTeacherExperience: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId, experienceId } = req.params;
    const updated = await teacherService.updateTeacherExperience(
      schoolId,
      teacherId,
      experienceId,
      req.body,
    );
    return sendSuccess(res, updated, 'Experience record updated successfully');
  }),

  /**
   * DELETE /api/teachers/:teacherId/experience/:experienceId
   */
  deleteTeacherExperience: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId, experienceId } = req.params;
    const result = await teacherService.deleteTeacherExperience(
      schoolId,
      teacherId,
      experienceId,
    );
    return sendSuccess(res, result, 'Experience record deleted successfully');
  }),

  /**
   * GET /api/teachers/:teacherId/documents
   */
  getTeacherDocuments: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const documents = await teacherService.getTeacherDocuments(schoolId, teacherId);
    return sendSuccess(res, documents);
  }),

  /**
   * POST /api/teachers/:teacherId/documents
   */
  addTeacherDocument: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const created = await teacherService.addTeacherDocument(schoolId, teacherId, req.body);
    return sendSuccess(res, created, 'Document added successfully', 201);
  }),

  /**
   * DELETE /api/teachers/:teacherId/documents/:documentId
   */
  deleteTeacherDocument: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId, documentId } = req.params;
    const result = await teacherService.deleteTeacherDocument(schoolId, teacherId, documentId);
    return sendSuccess(res, result, 'Document deleted successfully');
  }),

  /**
   * GET /api/teachers/:teacherId/assignments
   */
  getTeacherAssignments: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const assignments = await teacherService.getTeacherAssignments(schoolId, teacherId);
    return sendSuccess(res, assignments);
  }),

  /**
   * GET /api/teachers/:teacherId/activities
   */
  getTeacherActivities: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { teacherId } = req.params;
    const activities = await teacherService.getTeacherActivities(schoolId, teacherId);
    return sendSuccess(res, activities);
  }),
};
