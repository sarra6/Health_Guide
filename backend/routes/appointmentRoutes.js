const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/upcoming', ctrl.getUpcoming);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
