const express = require('express');
const { contactLanding } = require('../controllers/contactController');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  forgotPassword,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
  loginGoogle,
  loginFacebook,
  sendCodeResetPass,
  resetPassword,
  registerShipper
} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/loginGoogle').post(loginGoogle);
router.route('/loginFacebook').post(loginFacebook);
router.route('/logout').get(logoutUser);
router.route('/contact').post(contactLanding);

router.route('/me').get(isAuthenticatedUser, getUserDetails);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/sendcode').post(sendCodeResetPass);
router.route('/password/reset').post(resetPassword);

router.route('/password/update').put(isAuthenticatedUser, updatePassword);

router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router
  .route('/admin/users')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router
  .route('/admin/shipper/register')
  .post(isAuthenticatedUser, authorizeRoles('admin'), registerShipper);

router
  .route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);
module.exports = router;
