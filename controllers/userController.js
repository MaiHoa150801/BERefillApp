const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const ValidatePhone = require('../utils/validatePhone');
const hbs = require('nodemailer-express-handlebars');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const nodemailer = require('nodemailer');
const path = require('path');
const validator = require('email-validator');
const { phone } = require('phone');
// Register User
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  let avatar = {};
  const { name, email, phone, password, address, cpassword } = req.body;

  if (cpassword == '') {
    return next(new ErrorHandler('Trường Xác nhận Mật khẩu trống', 400));
  }
  if (password !== cpassword) {
    return next(
      new ErrorHandler('Mật khẩu và xác thực mật khẩu không trùng nhau', 400)
    );
  }
  if (validator.validate(email) == false) {
    return next(new ErrorHandler('Email không có giá trị!', 400));
  }
  const emailuser = await User.findOne({ email });

  if (emailuser) {
    return next(new ErrorHandler('Email đã từng đăng kí', 400));
  }

  if (req.body.avatar) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const isValidatePhone = await ValidatePhone(phone);

  if (!isValidatePhone) {
    return next(new ErrorHandler('Số điện thoại không có giá trị', 401));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    address,
    avatar: avatar,
  });

  sendToken(user, 201, res);
});

// Login User
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Vui lòng nhập email và mật khẩu', 400));
  }
  if (validator.validate(email) == false) {
    return next(new ErrorHandler('Email không đúng định dạng!', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Email không tồn tại', 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Bạn đã nhập mật khẩu sai', 400));
  }

  sendToken(user, 201, res);
});

exports.loginGoogle = asyncErrorHandler(async (req, res, next) => {
  const { googleId, email, name, avatar } = req.body;
  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    sendToken(oldUser, 200, res);
  } else {
    const user = await new User({
      googleId: googleId,
      name: name,
      email: email,
      avatar: {
        url: avatar,
      },
    });
    await user.save();
    sendToken(user, 200, res);
  }
});
exports.loginFacebook = asyncErrorHandler(async (req, res, next) => {
  const { facebookId, name, avatar } = req.body;
  const oldUser = await User.findOne({ facebookId: facebookId });
  if (oldUser) {
    sendToken(oldUser, 200, res);
  } else {
    const user = await new User({
      facebookId: facebookId,
      name: name,
      avatar: {
        url: avatar,
      },
    });
    await user.save();
    sendToken(user, 200, res);
  }
});

// Logout User
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged Out',
  });
});

// Get User Details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});
// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  if (validator.validate(req.body.email) == false) {
    return next(new ErrorHandler('Email không đúng định dạng!', 400));
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('Email chưa đăng kí', 404));
  }

  await user.getResetPasswordCode();
  user.save().then((user) => {
    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'syn282002@gmail.com', // generated ethereal user
          pass: 'synguyen282001', // generated ethereal password
        },
      });
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve('./views/'),
          defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
      };
      transporter.use('compile', hbs(handlebarOptions));

      var mailOptions = {
        from: 'refillapp@gmail.com',
        to: req.body.email,
        subject: 'Forgot password email!',
        template: 'email',
        context: {
          code: user.resetPasswordCode,
        },
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return next(new ErrorHandler('Không thể gửi được email!', 500));
        } else {
          res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
          });
        }
      });
    } catch (error) {}
  });
});

// Reset Password
exports.sendCodeResetPass = asyncErrorHandler(async (req, res, next) => {
  const { code, email } = req.body;
  console.log(req.body);
  if (validator.validate(email) == false) {
    return next(new ErrorHandler('Email không đúng định dạng!', 400));
  }
  const date = new Date(Date.now());
  const user = await User.findOne({
    email: email,
    resetPasswordCode: code,
  });
  const compare = date > user.resetPasswordExpire;
  if (!user || compare == true)
    return res
      .status(401)
      .json({ message: 'Mã code để thay đổi mật khẩu không tồn tại hoặc hết hạn.' });
  else
    res.status(200).json({
      success: true,
    });
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { password, email } = req.body;
  if (validator.validate(email) == false) {
    return next(new ErrorHandler('Email không đúng định dạng!', 400));
  }
  const user = await User.findOne({
    email: email,
  });
  user.password = password;
  await user.save();
  if (!user)
    return res
      .status(401)
      .json({ message: 'Mã code thay đổi password không tồn tại hoặc hết hạn.' });
  else
    res.status(200).json({
      success: true,
    });
});

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Old Password is Invalid', 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 201, res);
});

// Update User Profile
exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
  if (req.body.email && !validator.validate(req.body.email)) {
    return next(new ErrorHandler('Email không đúng định dạng!', 400));
  }

  if (req.body.avatar) {
    const user = await User.findById(req.user.id);

    if(!user.avatar.public_id ){
      next();
    }
    if(user.avatar.public_id ){
      const imageId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);
    }
    
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });

    req.body.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, req.body);

  res.status(200).json({
    success: true,
    user,
  });
});

// ADMIN DASHBOARD

// Get All Users --ADMIN
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// Get Single User Details --ADMIN
exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Register User
exports.registerShipper = asyncErrorHandler(async (req, res, next) => {
  let avatar = {};
  const { name, email, phone, password, address, cpassword } = req.body;

  if (cpassword == '') {
    return next(new ErrorHandler('Trường Xác nhận Mật khẩu trống', 400));
  }
  if (password !== cpassword) {
    return next(
      new ErrorHandler('Mật khẩu và xác thực mật khẩu không trùng nhau', 400)
    );
  }
  if (validator.validate(email) == false) {
    return next(new ErrorHandler('Email không có giá trị!', 400));
  }
  const emailuser = await User.findOne({ email });

  if (emailuser) {
    return next(new ErrorHandler('Email đã từng đăng kí', 400));
  }

  if (req.body.avatar) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const isValidatePhone = await ValidatePhone(phone);

  if (!isValidatePhone) {
    return next(new ErrorHandler('Số điện thoại không có giá trị', 401));
  }

  const shipper = await User.create({
    name,
    email,
    phone,
    password,
    address,
    avatar: avatar,
    role: "shipper"
  });

  sendToken(shipper, 201, res);
});


// Update User Role --ADMIN
exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete Role --ADMIN
exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
  });
});
