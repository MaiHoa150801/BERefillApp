const Salesperson = require('../models/SalespersonModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const path = require('path');
const ShipperMapModel = require('../models/ShipperMapModel');

exports.createShipperMap = asyncErrorHandler(async (req, res, next) => {
  const shipperMap = await ShipperMapModel.create(req.body);

  res.status(200).json({
    success: true,
    shipperMap,
  });
});
exports.getShipperMap = asyncErrorHandler(async (req, res, next) => {
  const shipperMap = await ShipperMapModel.findOne({
    account_id: req.params.account_id,
  });
  res.status(200).json({
    success: true,
    shipperMap,
  });
});

exports.updateCurrent = asyncErrorHandler(async (req, res, next) => {
  req.body.id = req.user.id;
  await req.io.emit(`data/${req.user.id}`, req.body);
  res.status(200).json({
    success: true,
  });
});
