const express = require('express');
const { socketIOMiddleware } = require('../app');
const {
  createShipperMap,
  updateCurrent,
  getShipperMap,
} = require('../controllers/shipperMapController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const router = express.Router();

router.post('/shippermap', createShipperMap);
router.get('/shippermap/:account_id', socketIOMiddleware, getShipperMap);
router.post(
  '/shippermap/updateCurrent',
  isAuthenticatedUser,
  authorizeRoles('shipper'),
  socketIOMiddleware,
  updateCurrent
);

module.exports = router;
