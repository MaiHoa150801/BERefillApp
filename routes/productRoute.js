const express = require('express');
const {
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  getProductReviews,
  deleteReview,
  createProductReview,
  createProduct,
  getAdminProducts,
  getProducts,
  getSalerProducts,
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/products/all').get(getProducts);

router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('salesperson'), createProduct);

router
  .route('/saler/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('salesperson'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('salesperson'), deleteProduct);
router
  .route('/saler/product')
  .get(isAuthenticatedUser, authorizeRoles('salesperson'), getSalerProducts);
router.route('/product/:id').get(getProductDetails);

router.route('/review').put(isAuthenticatedUser, createProductReview);

router
  .route('/admin/reviews')
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router;
