const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/medicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.patch('/:id/taken', ctrl.markTaken);
router.delete('/:id', ctrl.remove);

module.exports = router;
