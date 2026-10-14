import { Request, Response } from 'express';
import { academicSetupService } from '../services/academicSetupService';
import { parsePagination } from '../utils/pagination';
import { sendSuccess, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export const academicSetupController = {
  // ==========================================
  // CLASSES
  // ==========================================

  listClasses: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const pagination = parsePagination(req.query);
    const search = req.query.search as string | undefined;

    const result = await academicSetupService.listClasses(schoolId, pagination, search);
    return sendPaginated(res, result.data, result.meta);
  }),

  getClassById: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;

    const cls = await academicSetupService.getClassById(schoolId, id);
    return sendSuccess(res, cls);
  }),

  createClass: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const created = await academicSetupService.createClass(schoolId, req.body);
    return sendSuccess(res, created, 'Class created successfully', 201);
  }),

  updateClass: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;
    const updated = await academicSetupService.updateClass(schoolId, id, req.body);
    return sendSuccess(res, updated, 'Class updated successfully');
  }),

  deleteClass: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;
    await academicSetupService.deleteClass(schoolId, id);
    return sendSuccess(res, { id }, 'Class deleted successfully');
  }),

  // ==========================================
  // SECTIONS
  // ==========================================

  listSections: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.academicYearId!;
    const pagination = parsePagination(req.query);
    const classId = req.query.classId as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await academicSetupService.listSections(
      schoolId,
      academicYearId,
      pagination,
      classId,
      search,
    );
    return sendPaginated(res, result.data, result.meta);
  }),

  getSectionById: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.academicYearId!;
    const id = req.params.id;

    const section = await academicSetupService.getSectionById(schoolId, academicYearId, id);
    return sendSuccess(res, section);
  }),

  createSection: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.body.academicYearId || req.academicYearId || '';
    const created = await academicSetupService.createSection(schoolId, academicYearId, req.body);
    return sendSuccess(res, created, 'Section created successfully', 201);
  }),

  updateSection: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.academicYearId!;
    const id = req.params.id;
    const updated = await academicSetupService.updateSection(
      schoolId,
      academicYearId,
      id,
      req.body,
    );
    return sendSuccess(res, updated, 'Section updated successfully');
  }),

  deleteSection: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.academicYearId!;
    const id = req.params.id;
    await academicSetupService.deleteSection(schoolId, academicYearId, id);
    return sendSuccess(res, { id }, 'Section deleted successfully');
  }),

  // ==========================================
  // SUBJECTS
  // ==========================================

  listSubjects: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const pagination = parsePagination(req.query);
    const search = req.query.search as string | undefined;
    const subjectType = req.query.subjectType as string | undefined;
    const isElective =
      req.query.isElective !== undefined ? req.query.isElective === 'true' : undefined;

    const result = await academicSetupService.listSubjects(
      schoolId,
      pagination,
      search,
      subjectType,
      isElective,
    );
    return sendPaginated(res, result.data, result.meta);
  }),

  getSubjectById: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;

    const subject = await academicSetupService.getSubjectById(schoolId, id);
    return sendSuccess(res, subject);
  }),

  createSubject: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const created = await academicSetupService.createSubject(schoolId, req.body);
    return sendSuccess(res, created, 'Subject created successfully', 201);
  }),

  updateSubject: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;
    const updated = await academicSetupService.updateSubject(schoolId, id, req.body);
    return sendSuccess(res, updated, 'Subject updated successfully');
  }),

  deleteSubject: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;
    await academicSetupService.deleteSubject(schoolId, id);
    return sendSuccess(res, { id }, 'Subject deleted successfully');
  }),

  // ==========================================
  // CURRICULUM (ClassSubject)
  // ==========================================

  listCurriculum: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = (req.query.academicYearId as string) || req.academicYearId;
    const classId = req.query.classId as string | undefined;
    const subjectId = req.query.subjectId as string | undefined;

    const records = await academicSetupService.listCurriculum(
      schoolId,
      academicYearId,
      classId,
      subjectId,
    );
    return sendSuccess(res, records);
  }),

  getCurriculumById: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;
    const academicYearId = (req.query.academicYearId as string) || req.academicYearId;

    const record = await academicSetupService.getCurriculumById(schoolId, id, academicYearId);
    return sendSuccess(res, record);
  }),

  createCurriculum: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.body.academicYearId || req.academicYearId;
    const payload = { ...req.body, academicYearId };
    const created = await academicSetupService.createCurriculum(schoolId, payload);
    return sendSuccess(res, created, 'Curriculum mapped successfully', 201);
  }),

  updateCurriculum: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;
    const academicYearId =
      req.body.academicYearId || (req.query.academicYearId as string) || req.academicYearId;
    const payload = { ...req.body, academicYearId };
    const updated = await academicSetupService.updateCurriculum(schoolId, id, payload);
    return sendSuccess(res, updated, 'Curriculum mapping updated successfully');
  }),

  deleteCurriculum: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const id = req.params.id;
    await academicSetupService.deleteCurriculum(schoolId, id);
    return sendSuccess(res, { id }, 'Curriculum mapping deleted successfully');
  }),

  bulkCurriculum: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.body.academicYearId || req.academicYearId;
    const payload = { ...req.body, academicYearId };
    const result = await academicSetupService.bulkCurriculumMapping(schoolId, payload);
    return sendSuccess(res, result, 'Bulk curriculum mapped successfully');
  }),

  // ==========================================
  // TEACHER ASSIGNMENTS
  // ==========================================

  listAssignments: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.academicYearId!;
    const sectionId = (req.query.sectionId || req.query.academicYearSectionId) as
      string | undefined;
    const staffId = req.query.staffId as string | undefined;
    const isClassTeacher =
      req.query.isClassTeacher !== undefined ? req.query.isClassTeacher === 'true' : undefined;

    const assignments = await academicSetupService.listAssignments(
      schoolId,
      academicYearId,
      sectionId,
      staffId,
      isClassTeacher,
    );
    return sendSuccess(res, assignments);
  }),

  createAssignment: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.academicYearId!;
    const created = await academicSetupService.createAssignment(schoolId, academicYearId, req.body);
    return sendSuccess(res, created, 'Teacher assigned successfully', 201);
  }),

  deleteAssignment: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.schoolId!;
    const academicYearId = req.academicYearId!;
    const id = req.params.id;
    await academicSetupService.deleteAssignment(schoolId, academicYearId, id);
    return sendSuccess(res, { id }, 'Teacher assignment removed successfully');
  }),
};
