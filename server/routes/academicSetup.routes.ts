import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSchoolContext } from '../middleware/schoolContextMiddleware';
import { requireAcademicYearContext } from '../middleware/academicYearContextMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import { validate } from '../validators/validate';
import {
  idParamSchema,
  createClassSchema,
  updateClassSchema,
  createSectionSchema,
  updateSectionSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createCurriculumSchema,
  updateCurriculumSchema,
  bulkCurriculumSchema,
  createTeacherAssignmentSchema,
} from '../validators/academicSetupValidators';
import { academicSetupController } from '../controllers/academicSetupController';

const router = Router();

// Multi-tenant isolation: All academic routes strictly require Authenticated User, Active School Context, and Validated Academic Year Context
router.use(requireAuth);
router.use(requireSchoolContext);
router.use(requireAcademicYearContext);

// ==========================================
// 1. CLASS ROUTES
// ==========================================

router.get(
  '/classes',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  academicSetupController.listClasses,
);

router.post(
  '/classes',
  requirePermission('academics.sections.manage'),
  validate(createClassSchema),
  academicSetupController.createClass,
);

router.get(
  '/classes/:id',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  validate(idParamSchema),
  academicSetupController.getClassById,
);

router.put(
  '/classes/:id',
  requirePermission('academics.sections.manage'),
  validate(updateClassSchema),
  academicSetupController.updateClass,
);

router.delete(
  '/classes/:id',
  requirePermission('academics.sections.manage'),
  validate(idParamSchema),
  academicSetupController.deleteClass,
);

// ==========================================
// 2. SECTION ROUTES (AcademicYearSection)
// ==========================================

router.get(
  '/sections',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  academicSetupController.listSections,
);

router.post(
  '/sections',
  requirePermission('academics.sections.manage'),
  validate(createSectionSchema),
  academicSetupController.createSection,
);

router.get(
  '/sections/:id',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  validate(idParamSchema),
  academicSetupController.getSectionById,
);

router.put(
  '/sections/:id',
  requirePermission('academics.sections.manage'),
  validate(updateSectionSchema),
  academicSetupController.updateSection,
);

router.delete(
  '/sections/:id',
  requirePermission('academics.sections.manage'),
  validate(idParamSchema),
  academicSetupController.deleteSection,
);

// ==========================================
// 3. SUBJECT ROUTES
// ==========================================

router.get(
  '/subjects',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  academicSetupController.listSubjects,
);

router.post(
  '/subjects',
  requirePermission('academics.curriculum.edit'),
  validate(createSubjectSchema),
  academicSetupController.createSubject,
);

router.get(
  '/subjects/:id',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  validate(idParamSchema),
  academicSetupController.getSubjectById,
);

router.put(
  '/subjects/:id',
  requirePermission('academics.curriculum.edit'),
  validate(updateSubjectSchema),
  academicSetupController.updateSubject,
);

router.delete(
  '/subjects/:id',
  requirePermission('academics.curriculum.edit'),
  validate(idParamSchema),
  academicSetupController.deleteSubject,
);

// ==========================================
// 4. CURRICULUM (CLASS-SUBJECT MAPPING) ROUTES
// ==========================================

router.get(
  '/curriculum',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  academicSetupController.listCurriculum,
);

router.post(
  '/curriculum',
  requirePermission('academics.curriculum.edit'),
  validate(createCurriculumSchema),
  academicSetupController.createCurriculum,
);

router.post(
  '/curriculum/bulk',
  requirePermission('academics.curriculum.edit'),
  validate(bulkCurriculumSchema),
  academicSetupController.bulkCurriculum,
);

router.get(
  '/curriculum/:id',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  validate(idParamSchema),
  academicSetupController.getCurriculumById,
);

router.put(
  '/curriculum/:id',
  requirePermission('academics.curriculum.edit'),
  validate(updateCurriculumSchema),
  academicSetupController.updateCurriculum,
);

router.delete(
  '/curriculum/:id',
  requirePermission('academics.curriculum.edit'),
  validate(idParamSchema),
  academicSetupController.deleteCurriculum,
);

// ==========================================
// 5. TEACHER ASSIGNMENT ROUTES
// ==========================================

router.get(
  '/assignments',
  requirePermission('academics.sections.manage', 'academics.curriculum.edit'),
  academicSetupController.listAssignments,
);

router.post(
  '/assignments',
  requirePermission('academics.sections.manage'),
  validate(createTeacherAssignmentSchema),
  academicSetupController.createAssignment,
);

router.delete(
  '/assignments/:id',
  requirePermission('academics.sections.manage'),
  validate(idParamSchema),
  academicSetupController.deleteAssignment,
);

export default router;
