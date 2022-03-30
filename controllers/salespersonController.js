const Salesperson = require('../models/SalespersonModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const path = require('path');
const Resize = require('../root/Resize');
const cloudinary = require('cloudinary');
const ValidatePhone = require('../utils/validatePhone');
const validator = require('email-validator');

exports.getAllSalesperson = asyncErrorHandler(async (req, res, next) => {
  const salespersons = await Salesperson.find().populate({
    model: 'Product',
    path: 'list_product',
  });

  res.status(200).json({
    success: true,
    salespersons,
  });
});

exports.getSalesperson = asyncErrorHandler(async (req, res, next) => {
  const salesperson = await Salesperson.find({
    account_id: req.params.account_id,
  }).populate({
    model: 'Product',
    path: 'list_product',
  });
  res.status(200).json({
    success: true,
    salesperson,
  });
});

exports.createSalesperson = asyncErrorHandler(async (req, res, next) => {
  let logo = {};

  const {account_id, name, email, phone_number, address, latitude, longitude, description } = req.body;

  // console.log(req.body);

  if (req.body.logo) {
    const myLogo = await cloudinary.v2.uploader.upload(req.body.logo, {
      folder: 'Logo',
      width: 150,
      crop: 'scale',
    });
    logo = {
      public_id: myLogo.public_id,
      url: myLogo.secure_url,
    };
  }
  
  const isValidatePhone = await ValidatePhone(phone_number);

  if (!isValidatePhone) {
    return next(new ErrorHandler(' Số điện thoại không đúng', 401));
  }

  const emailuser = await Salesperson.findOne({ email });
  console.log(emailuser);
  if (emailuser) {
    return next(new ErrorHandler('Email đã từng đăng kí', 400));
  }

  const account = await Salesperson.findOne({ account_id });
  console.log(account);
  if (account) {
    return next(new ErrorHandler('Tài khoản đã từng đăng kí', 400));
  }

  if (validator.validate(email) == false) {
    return next(new ErrorHandler('Email không có giá trị!', 400));
  }

  const salespersons = await Salesperson.create({
    name,
    email,
    phone_number,
    address,
    latitude,
    longitude,
    description,
    account_id,
    logo: logo,
  });

  if (req.body.role) {
    console.log(req.body.role);
    const user = await User.findById(account_id);
    console.log(user);
    user.role = "salesperson";
    await user.save();
  }

  res.status(200).json({
    success: true,
    salespersons,
  });
});

exports.updateSalesperson = asyncErrorHandler(async (req, res, next) => {
  const salesperson = await Salesperson.findById(req.params.id);
  if (!salesperson) {
    return next(new ErrorHandler('Salesperson Not Found', 404));
  }

  if (req.files) {
    const imagePath = path.join(__dirname, '../images/salesperson');
    const fileUpload = new Resize(imagePath, req.files.logo.name);
    const fileUrl = await fileUpload.save(req.files.logo.data);
    req.body.logo = fileUrl;
  }

  const salespersons = await Salesperson.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    salespersons,
  });
});
