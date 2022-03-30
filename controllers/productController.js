const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const path = require('path');
const Resize = require('../root/Resize');
const cloudinary = require('cloudinary');
const Salesperson = require('../models/SalespersonModel');
const SalespersonModel = require('../models/SalespersonModel');

// Get All Products ---Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});
exports.getSalerProducts = asyncErrorHandler(async (req, res, next) => {
  const saler = await SalespersonModel.findOne({
    account_id: req.user.id,
  }).populate({
    model: 'Product',
    path: 'list_product',
  });
  const products = saler.list_product;
  res.status(200).json({
    success: true,
    products,
  });
});
// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Create Product ---SALER
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
  let list_images = [];
  if (typeof req.body.list_images === 'string') {
    list_images.push(req.body.list_images);
  } else {
    list_images = req.body.list_images;
  }
  const imagesLink = [];
  for (let i = 0; i < list_images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(list_images[i], {
      folder: 'products',
    });
    await imagesLink.push(result.secure_url);
  }

  const result = await cloudinary.v2.uploader.upload(req.body.logo, {
    folder: 'trademark',
  });

  const tradeMark = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  req.body.trademark = {
    name: req.body.tradeMarkName,
    logo: tradeMark,
  };
  req.body.list_images = imagesLink;

  console.log(req.user.id);
  const product = await Product.create(req.body);
  const saler = await Salesperson.findOne({
    account_id: req.user.id,
  });
  saler.list_product.push(product.id);
  await saler.save();

  res.status(201).json({
    success: true,
    product,
  });
});

// Update Product ---ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }
  let images = [''];
  if (req.files) {
    const imagePath = path.join(__dirname, '../images/products');
    images = await Promise.all(
      req.files.list_image.map(async (e) => {
        if (typeof e === 'string') return e;
        else {
          const fileUpload = new Resize(imagePath, e.name);
          const fileUrl = await fileUpload.save(e.data);
          return fileUrl;
        }
      })
    );
    req.body.list_image = images;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(201).json({
    success: true,
    product,
  });
});

// Delete Product ---ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }
  await product.remove();

  res.status(201).json({
    success: true,
  });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }

  const isReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Reveiws
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings: Number(ratings),
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
