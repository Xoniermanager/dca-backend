const express = require('express');
const { createPatient, getPatient, updatePatient, getDoctors, getAppointments, getPrescriptions, getPrescriptionDetails, createReport, getReports, getDashboard, submitTestReport, getUpcommingAppointments, getCompletedAppointments } = require('../contollers/patientController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route('/create').post(isAuthenticatedUser,createPatient);
router.route('/update').post(isAuthenticatedUser,updatePatient);

router.route('/').get(isAuthenticatedUser, getPatient);

router.route('/doctors').get(isAuthenticatedUser, getDoctors);

router.route('/appointments/:userId').get(isAuthenticatedUser, getAppointments);
router.route('/upcomming-appointments').get(isAuthenticatedUser, getUpcommingAppointments);
router.route('/completed-appointments').get(isAuthenticatedUser, getCompletedAppointments);

router.route('/prescriptions').get(isAuthenticatedUser, getPrescriptions);

router.route('/prescription/:presId').get(isAuthenticatedUser, getPrescriptionDetails);

router.route('/create-report').post(isAuthenticatedUser,createReport);

router.route('/reports').get(isAuthenticatedUser,getReports);

router.route('/submit-report').post(isAuthenticatedUser,submitTestReport);

router.route('/dashboard').post(isAuthenticatedUser,getDashboard);

module.exports = router;