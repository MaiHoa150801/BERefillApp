const UserVoucher = require('../models/userVoucherModel');
const Voucher = require('../models/voucherModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const userVoucherModel = require('../models/userVoucherModel');
exports.getAllVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.find();
  res.status(200).json({
    success: true,
    voucher,
  });
});

exports.getVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.find({
    $or: [
      {
        salesperson_id: req.params.saler_id,
      },
      {
        type: 'Admin voucher',
      },
    ],
  });
  res.status(200).json({
    success: true,
    voucher,
  });
});
exports.getVoucherSaler = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.find({
    salesperson_id: req.user.id,
  });
  res.status(200).json({
    success: true,
    voucher,
  });
});
exports.createVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.findOne({
    code: req.body.code,
  });
  if (voucher) {
    return next(new ErrorHandler('Voucher already exists!'));
  }
  if (req.body.type !== 'Admin voucher') {
    req.body.salesperson_id = req.user.id;
  }

  const vouchers = await Voucher.create(req.body);
  res.status(201).json({
    success: true,
    vouchers,
  });
});

exports.updateVoucher = asyncErrorHandler(async (req, res, next) => {
  console.log(req.params.id);
  const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(201).json({
    success: true,
    voucher,
  });
});

exports.getUserVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await userVoucherModel.findOne({
    account_id: req.params.account_id,
  });

  res.status(201).json({
    success: true,
    voucher,
  });
});

exports.UserGetVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await userVoucherModel
    .findOne({
      account_id: req.params.account_id,
    })
    .populate({
      model: 'Voucher',
      path: 'list_voucher_id',
    });

  res.status(201).json({
    success: true,
    voucher,
  });
});

exports.userSaveVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.findById(req.body.voucher_id);
  if (!voucher) {
    return next(new ErrorHandler('Voucher Not Found', 404));
  }
  if (voucher.quantity === 0) {
    return next(new ErrorHandler('Vouchers are out of stock', 404));
  }
  const userVoucher = await UserVoucher.findOne({
    account_id: req.body.account_id,
  });
  if (userVoucher) {
    if (
      userVoucher.list_voucher_id &&
      userVoucher.list_voucher_id.indexOf(req.body.voucher_id) !== -1
    ) {
      return next(new ErrorHandler('You saved voucher!', 404));
    }
    if (
      userVoucher.list_voucher_id &&
      userVoucher.list_voucher_used.indexOf(req.body.voucher_id) !== -1
    ) {
      return next(new ErrorHandler('You used voucher!', 404));
    }

    let listVoucher = userVoucher.list_voucher_id
      ? userVoucher.list_voucher_id
      : [];
    await listVoucher.push(req.body.voucher_id);

    await UserVoucher.findByIdAndUpdate(userVoucher._id, {
      list_voucher_id: listVoucher,
    });
    await updateQuantityVoucher(req.body.voucher_id, 1);
  } else {
    req.body.list_voucher_id = [req.body.voucher_id];
    UserVoucher.create(req.body);
  }

  res.status(201).json({
    success: true,
    userVoucher,
  });
});

const updateQuantityVoucher = async (voucher_id, numberMinus) => {
  const voucher = await Voucher.findById(voucher_id);
  await Voucher.findByIdAndUpdate(voucher_id, {
    quantity: Number.parseInt(voucher.quantity) - Number.parseInt(numberMinus),
  });
};

exports.userUseVoucher = async (account_id, voucher_id) => {
  const voucher = await Voucher.findById(voucher_id);
  if (new Date() > voucher.expiry_date) {
    return next(new ErrorHandler('Voucher has expired!', 404));
  }
  let userVoucher = await UserVoucher.findOne({ account_id: account_id });
  let vouchers = userVoucher.list_voucher_id;
  const index = vouchers.indexOf(voucher_id);
  let _voucher = await vouchers.splice(index, 1);
  let voucherUse = userVoucher.list_voucher_used;
  voucherUse.push(voucher_id);
  await UserVoucher.findOneAndUpdate(
    { account_id: account_id },
    {
      list_voucher_id: vouchers,
      list_voucher_used: voucherUse,
    }
  );
};

exports.deleteVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.findById(req.params.id);
  if (!voucher) {
    return next(new ErrorHandler('Voucher Not Found', 404));
  }
  await voucher.remove();

  res.status(201).json({
    success: true,
  });
});
