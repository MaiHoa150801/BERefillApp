const express = require('express');
const {
  getRatingProduct,
  ratingProduct,
} = require('../controllers/RatingProductController');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
router.get('/ratingproduct/:product_id', getRatingProduct);
router.post(
  '/ratingproduct/:id',
  isAuthenticatedUser,
  authorizeRoles('user'),
  ratingProduct
);

module.exports = router;
