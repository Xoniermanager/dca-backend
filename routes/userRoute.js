const express = require('express');
const { registerUser, loginUser,updateCredentail, myProfile, verifyEmail, forgotPassword,
     resetPassword, updatePassword,getDoctorMontlyEarning,getPatientPayment,updateEmailTemplate, updateProfile,updateFee, updateLanguage, updateExperience, updateAccademicAward, createDrug, getDrugs, createTest, getTests, createPrescription, getPrescriptions, deleteDrug, deleteTest, getDrugDetails, getTestDetails, updateDrug, updateTest, deletePrescription, getPrescriptionDetails, updatePrescription, createSlots, getSlots, getSlotDetails, updateSlot, deleteSlot, getSlotsByDate, createDoctorAppointment, getDoctorAppointments, deleteDoctorAppointment, getDoctorAppointmentById, updateDoctorAppointment, searchDoctors, userEnquiry, resetOTP, getDoctorDetails, newCreateDoctorAppointment, getTodayDoctorAppointments,getPaymentDetails,getAllPrescriptionDetails,getBlogsDetails,getDoctorSlots,getMondaySlots } = require('../contollers/userController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();
router.route('/enquiry').post(userEnquiry);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/me').get(isAuthenticatedUser, myProfile);
router.route('/verify/email/:id').get(verifyEmail);
router.route('/forget/password').post(forgotPassword);
router.route("/otp/validate").post(resetOTP);
router.route('/blog-details/:id').get(getBlogsDetails);
router.route('/get-all-slot').post(getDoctorSlots);
router.route("/password/reset/:userId").put(resetPassword);
router.route('/update/password').put(isAuthenticatedUser, updatePassword);
router.route('/get-mon-slot').post(getMondaySlots);
router.route('/update/credential').put(isAuthenticatedUser, updateCredentail);
router.route('/search/doctor/:key').get(isAuthenticatedUser, searchDoctors);
router.route('/doctor-details/:doctId').get(isAuthenticatedUser, getDoctorDetails);
router.route('/payment-details/:orderId').get(isAuthenticatedUser, getPaymentDetails);

router.route('/doctor-monthly-earning/:doctorId').get(isAuthenticatedUser, getDoctorMontlyEarning);
router.route('/patient-payment/:patientId').get(isAuthenticatedUser, getPatientPayment);
router.route('/get-all-prescription/:patientId').get(isAuthenticatedUser, getAllPrescriptionDetails);
//router.route('/callback').get(isAuthenticatedUser, getDoctorDetails);

//route.route('/paytm/payment').post(paytmPayment);

router.route('/doctor/update').put(isAuthenticatedUser, updateProfile);
router.route('/doctor/updateFee').put(isAuthenticatedUser, updateFee);
router.route('/doctor/updateemailtemplate').put(isAuthenticatedUser, updateEmailTemplate);
router.route('/doctor/language').put(isAuthenticatedUser, updateLanguage);
router.route('/doctor/experience').put(isAuthenticatedUser, updateExperience);
router.route('/doctor/awardclinic').post(isAuthenticatedUser, updateAccademicAward);

router.route('/create-drug').post(isAuthenticatedUser, createDrug);
router.route('/drugs').get(isAuthenticatedUser, getDrugs);
router.route('/delete-drug/:id').delete(isAuthenticatedUser, deleteDrug);
router.route('/edit-drug/:id').get(isAuthenticatedUser, getDrugDetails);
router.route('/update-drug/:id').put(isAuthenticatedUser, updateDrug);

router.route('/create-test').post(isAuthenticatedUser, createTest);
router.route('/tests').get(isAuthenticatedUser, getTests);
router.route('/delete-test/:id').delete(isAuthenticatedUser, deleteTest);
router.route('/edit-test/:id').get(isAuthenticatedUser, getTestDetails);
router.route('/update-test/:id').put(isAuthenticatedUser, updateTest);

router.route('/create-prescription').post(isAuthenticatedUser, createPrescription);
router.route('/prescriptions').get(isAuthenticatedUser, getPrescriptions);
router.route('/delete-prescription/:id').delete(isAuthenticatedUser, deletePrescription);
router.route('/edit-prescription/:id').get(isAuthenticatedUser, getPrescriptionDetails);
router.route('/update-prescription/:id').put(isAuthenticatedUser, updatePrescription);




router.route('/create-slots').post(isAuthenticatedUser, createSlots);
router.route('/all-slots').get(isAuthenticatedUser, getSlots);
router.route('/edit-slot/:slotId').get(isAuthenticatedUser, getSlotDetails);
router.route('/update-slot/:slotId').put(isAuthenticatedUser, updateSlot);
router.route('/delete-slot/:slotId').delete(isAuthenticatedUser, deleteSlot);
router.route('/my-slot').post(getSlotsByDate);

router.route('/create-appointment').post(isAuthenticatedUser, createDoctorAppointment);
router.route('/doctor-appointments').get(isAuthenticatedUser, getDoctorAppointments);
router.route('/delete-appointment/:appId').delete(isAuthenticatedUser, deleteDoctorAppointment);
router.route('/appointment-detail/:appId').get(isAuthenticatedUser, getDoctorAppointmentById);

router.route('/today-doctor-appointments').get(isAuthenticatedUser, getTodayDoctorAppointments);


router.route('/new-create-appointment').post(isAuthenticatedUser, newCreateDoctorAppointment);

module.exports = router;