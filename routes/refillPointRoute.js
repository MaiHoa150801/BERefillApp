const express = require('express');
const {
  getAllRefillPoint,
  getRefillPoint,
} = require('../controllers/RefillPointController');
const router = express.Router();

router.get('/refillpoint', getAllRefillPoint);
router.get('/refillpoint/:account_id', getRefillPoint);

module.exports = router;
