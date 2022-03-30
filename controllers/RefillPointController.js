const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const path = require('path');
const RefillPointModel = require('../models/RefillPointModel');

exports.getAllRefillPoint = asyncErrorHandler(async (req, res, next) => {
  const refillPoint = await RefillPointModel.find()
    .sort({ score: -1 })
    .populate({
      model: 'User',
      path: 'account_id',
    });

  res.status(200).json({
    success: true,
    refillPoint,
  });
});

exports.getRefillPoint = asyncErrorHandler(async (req, res, next) => {
  const refillPoint = await RefillPointModel.findOne({
    account_id: req.params.account_id,
  });

  res.status(200).json({
    success: true,
    refillPoint,
  });
});

exports.updateRefillPoint = async (account_id, score) => {
  const fine = await RefillPointModel.findOne({
    account_id: account_id,
  });
  if (fine) {
    const refillPoint = await RefillPointModel.findOneAndUpdate(
      {
        account_id: account_id,
      },
      {
        score: score + fine.score,
      }
    );
  } else {
    const refillPoint = await RefillPointModel.create({
      account_id: account_id,
      score: score,
    });
  }
};
