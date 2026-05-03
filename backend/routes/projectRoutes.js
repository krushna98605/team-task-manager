const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/:id').get(protect, getProject).delete(protect, deleteProject);

module.exports = router;
