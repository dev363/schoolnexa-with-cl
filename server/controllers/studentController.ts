import { Request, Response } from 'express';
import { studentService } from '../services/studentService';
import { parsePagination } from '../utils/pagination';
import { parseSearch, parseSort } from '../utils/query';
import { sendSuccess, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

const ALLOWED_SORT_FIELDS = [
  'firstName',
  'lastName',
  'admissionNumber',
  'createdAt',
  'dateOfBirth',
] as const;

export const studentController = {
  /**
   * GET /api/students
   * List students with filtering, search, sorting, and pagination.
   */
  listStudents: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const pagination = parsePagination(req.query);
    const search = parseSearch(req.query);
    const sort = parseSort(req.query, ALLOWED_SORT_FIELDS, 'createdAt', 'desc');

    const result = await studentService.listStudents(schoolId, pagination, {
      search,
      status: req.query.status as any,
      gender: req.query.gender as string,
      bloodGroup: req.query.bloodGroup as string,
      classId: req.query.classId as string,
      sectionId: req.query.sectionId as string,
      academicYearId: (req.query.academicYearId as string) || req.academicYearId,
      sortBy: sort.field,
      sortOrder: sort.direction,
    });

    return sendPaginated(res, result.data, result.meta);
  }),

  /**
   * GET /api/students/:studentId
   * Retrieve full details of a specific student.
   */
  getStudentById: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { studentId } = req.params;

    const student = await studentService.getStudentById(schoolId, studentId);
    return sendSuccess(res, student);
  }),

  /**
   * POST /api/students
   * Admit / register a new student master record.
   */
  createStudent: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const created = await studentService.createStudent(schoolId, req.body);
    return sendSuccess(res, created, 'Student admitted successfully', 201);
  }),

  /**
   * PUT /api/students/:studentId
   * Update student master record.
   */
  updateStudent: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { studentId } = req.params;

    const updated = await studentService.updateStudent(schoolId, studentId, req.body);
    return sendSuccess(res, updated, 'Student updated successfully');
  }),

  /**
   * PATCH /api/students/:studentId/status
   * Activate or de-activate (archive) a student.
   */
  updateStudentStatus: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { studentId } = req.params;

    const updated = await studentService.updateStudentStatus(schoolId, studentId, req.body);
    return sendSuccess(res, updated, `Student status updated to ${req.body.status}`);
  }),

  /**
   * DELETE /api/students/:studentId
   * Soft-delete student record.
   */
  deleteStudent: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const { studentId } = req.params;

    await studentService.deleteStudent(schoolId, studentId);
    return sendSuccess(
      res,
      { id: studentId, status: 'INACTIVE' },
      'Student deactivated successfully',
    );
  }),
};
