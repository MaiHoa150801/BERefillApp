const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const path = require('path');
const Resize = require('../root/Resize');
const RatingModel = require('../models/RatingModel');
const listOrderModel = require('../models/listOrderModel');
const { updateRefillPoint } = require('./RefillPointController');
const productModel = require('../models/productModel');

exports.getRatingProduct = asyncErrorHandler(async (req, res, next) => {
  const ratingProduct = await RatingModel.find({
    product_id: req.params.product_id,
  }).populate({
    model: 'User',
    path: 'account_id',
  });
  res.status(200).json({
    success: true,
    ratingProduct,
  });
});

exports.ratingProduct = asyncErrorHandler(async (req, res, next) => {
  const product = productModel.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }
  let images = [''];
  if (req.body.list_image != null) {
    const imagePath = 'public/images/rating';
    images = await Promise.all(
      req.body.list_image.map(async (e) => {
        var buffer = Buffer.from(e.data, 'base64');
        const fileUpload = new Resize(imagePath, e.name);
        const fileUrl = await fileUpload.save(buffer);
        return 'http://refillpointapp.cleverapps.io/images/rating/' + e.name;
      })
    );
  }
  await updateRefillPoint(req.user.id, 200);
  req.body.list_image = images;
  req.body.product_id = req.params.id;
  const ratingProduct = await RatingModel.create(req.body);

  const order = await listOrderModel.findByIdAndUpdate(req.body.list_order_id, {
    evalute: 'Đã đánh giá',
  });
  res.status(200).json({
    success: true,
    ratingProduct,
  });
});
