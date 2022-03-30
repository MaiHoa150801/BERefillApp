const express = require('express');
const {
  createVoucher,
  userSaveVoucher,
  getAllVoucher,
  getVoucher,
  updateVoucher,
  deleteVoucher,
  getUserVoucher,
  UserGetVoucher,
  getVoucherSaler,
} = require('../controllers/VoucherController');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
router.route('/vouchers/all').get(getAllVoucher);
router.route('/vouchers/saler/:saler_id').get(isAuthenticatedUser, getVoucher);
router.route('/vouchers/saler').get(isAuthenticatedUser, getVoucherSaler);
router
  .route('/vouchers')
  .post(
    isAuthenticatedUser,
    authorizeRoles('admin', 'salesperson'),
    createVoucher
  );
router
  .route('/vouchers/:id')
  .delete(
    isAuthenticatedUser,
    authorizeRoles('admin', 'salesperson'),
    deleteVoucher
  );
router
  .route('/vouchers/:id')
  .put(
    isAuthenticatedUser,
    authorizeRoles('admin', 'salesperson'),
    updateVoucher
  );
router.route('/vouchers/usersave').post(userSaveVoucher);
router.route('/uservouchers/:account_id').get(getUserVoucher);
router.route('/usergetvouchers/:account_id').get(UserGetVoucher);

module.exports = router;
