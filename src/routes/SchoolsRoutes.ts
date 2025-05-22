import express from 'express';
import {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
} from '../controllers/SchoolsControllers';

const router = express.Router();

router.post('/create', createSchool);
router.get('/', getAllSchools);
router.get('/:id', getSchoolById);
router.put('/:id', updateSchool);
router.delete('/:id', deleteSchool);

export default router;
