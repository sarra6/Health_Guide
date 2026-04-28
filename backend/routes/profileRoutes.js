const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', ctrl.getProfile);
router.put('/', ctrl.updateProfile);

module.exports = router;
