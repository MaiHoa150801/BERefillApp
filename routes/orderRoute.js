const express = require('express');
const { socketIOMiddleware } = require('../app');
const {
  createOrder,
  getUserOrder,
  getAllOrderStatus,
  updateOrder,
  getShipperOrder,
  getOrderByID,
  getSalerOrder,
} = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const router = express.Router();

router.get(
  '/orders/shipper/',
  isAuthenticatedUser,
  authorizeRoles('shipper'),
  getShipperOrder
);
router.get(
  '/orders/saler/',
  isAuthenticatedUser,
  authorizeRoles('salesperson'),
  getSalerOrder
);
router.post('/orders', isAuthenticatedUser, createOrder);
router.get('/orders/:status', isAuthenticatedUser, getUserOrder);
router.get('/orders/status/:status', getAllOrderStatus);

router.put('/orders/:id', isAuthenticatedUser, socketIOMiddleware, updateOrder);

router.get('/order/:id', isAuthenticatedUser, getOrderByID);

module.exports = router;
