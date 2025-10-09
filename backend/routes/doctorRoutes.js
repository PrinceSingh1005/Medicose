const express = require('express');
const { getAllDoctors, getDoctorById, updateDoctorProfile, getDoctorPrescriptions, getMyDoctorProfile, getDoctorStats, getDoctorPatients, getPatientHistoryForDoctor, uploadProfilePhoto } = require('../controllers/doctorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', getAllDoctors);

router.get('/stats', protect, authorizeRoles('doctor'), getDoctorStats);
router.get('/profile/me', protect, authorizeRoles('doctor'), getMyDoctorProfile);
router.put('/profile', protect, authorizeRoles('doctor'), updateDoctorProfile);
router.get('/prescriptions', protect, authorizeRoles('doctor'), getDoctorPrescriptions);
router.get('/patients', protect, authorizeRoles('doctor'), getDoctorPatients);
router.get('/patients/:patientId', protect, authorizeRoles('doctor'), getPatientHistoryForDoctor);

router.get('/:id', getDoctorById);
router.post('/:id/uploadProfilePhoto', protect, authorizeRoles('doctor'), upload.single('profilePhoto'), uploadProfilePhoto);
module.exports = router;