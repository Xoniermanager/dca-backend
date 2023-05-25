const express = require('express');
const { getPatients, createDisease, getDiseases, deleteDisease, getDiseaseDetails, updateDisease, updateUserStatus, createDepartment, getDepartments, deleteDepartment, getDepartmentDetails, updateDepartment, createDoctor, createFaq, getFaqs, getFaqDetails, updateFaq, deletefaq, createNews, getNewses,getLatestNewses, getNewsDetails, updateNews, deleteNews, getDashbordDetails,createService, getService, updateService, deleteService,getServiceDetails,createStories, getStories, updateStories, deleteStories,getStoriesDetails,createClient, getClient, updateClient, deleteClient,getClientDetails,updateApproach,getApproachDetails,createApproach,updateAbout,getAboutDetails,createAbout } = require('../contollers/adminController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();
router.route('/patients/:userType').get(isAuthenticatedUser, getPatients);
router.route('/update-status/:userId').get(isAuthenticatedUser, updateUserStatus);
router.route('/create-doctor').post(isAuthenticatedUser, createDoctor);

router.route('/create-disease').post(isAuthenticatedUser, createDisease);
router.route('/all-diseases').get(isAuthenticatedUser, getDiseases);
router.route('/delete-disease/:id').delete(isAuthenticatedUser, deleteDisease);
router.route('/edit-disease/:id').get(isAuthenticatedUser, getDiseaseDetails);
router.route('/update-disease/:id').put(isAuthenticatedUser, updateDisease);

router.route('/create-department').post(isAuthenticatedUser, createDepartment);
router.route('/all-departments').get(getDepartments);
router.route('/delete-department/:id').delete(isAuthenticatedUser, deleteDepartment);
router.route('/edit-department/:id').get(isAuthenticatedUser, getDepartmentDetails);
router.route('/update-department/:id').put(isAuthenticatedUser, updateDepartment);

router.route('/create-faq').post(isAuthenticatedUser, createFaq);
router.route('/all-faqs').get(getFaqs);
router.route('/delete-faq/:id').delete(isAuthenticatedUser, deletefaq);
router.route('/edit-faq/:id').get(isAuthenticatedUser, getFaqDetails);
router.route('/update-faq/:id').put(isAuthenticatedUser, updateFaq);


//service 

router.route('/create-service').post(isAuthenticatedUser, createService);
router.route('/all-service').get(isAuthenticatedUser,getService);
router.route('/delete-service/:id').delete(isAuthenticatedUser, deleteService);
router.route('/edit-service/:id').get(isAuthenticatedUser, getServiceDetails);
router.route('/update-service/:id').put(isAuthenticatedUser, updateService);
//service


//stories 

router.route('/create-stories').post(isAuthenticatedUser, createStories);
router.route('/all-stories').get(isAuthenticatedUser,getStories);
router.route('/delete-stories/:id').delete(isAuthenticatedUser, deleteStories);
router.route('/edit-stories/:id').get(isAuthenticatedUser, getStoriesDetails);
router.route('/update-stories/:id').put(isAuthenticatedUser, updateStories);
//stories

//client 

router.route('/create-client').post(isAuthenticatedUser, createClient);
router.route('/all-client').get(isAuthenticatedUser,getClient);
router.route('/delete-client/:id').delete(isAuthenticatedUser, deleteClient);
router.route('/edit-client/:id').get(isAuthenticatedUser, getClientDetails);
router.route('/update-client/:id').put(isAuthenticatedUser, updateClient);

//client

router.route('/create-news').post(isAuthenticatedUser, createNews);
router.route('/all-newses').get(getNewses);
router.route('/all-latest-newses').get(getLatestNewses);
router.route('/delete-news/:id').delete(isAuthenticatedUser, deleteNews);
router.route('/edit-news/:id').get(isAuthenticatedUser, getNewsDetails);
router.route('/update-news/:id').put(isAuthenticatedUser, updateNews);


//approach
router.route('/create-approach').post(isAuthenticatedUser, createApproach);
router.route('/edit-approach/:id').get(isAuthenticatedUser, getApproachDetails);
router.route('/update-approach/:id').put(isAuthenticatedUser, updateApproach);


router.route('/create-about').post(isAuthenticatedUser, createAbout);
router.route('/edit-about/:id').get(isAuthenticatedUser, getAboutDetails);
router.route('/update-about/:id').put(isAuthenticatedUser, updateAbout);

router.route('/dashboard-details').get(isAuthenticatedUser, getDashbordDetails);

module.exports = router;