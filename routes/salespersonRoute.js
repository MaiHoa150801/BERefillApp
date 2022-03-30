const express = require('express');
const {
  getAllSalesperson,
  createSalesperson,
  updateSalesperson,
  getSalesperson,
} = require('../controllers/salespersonController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const router = express.Router();

router.get('/salespersons', getAllSalesperson);
router.get('/salesperson/:account_id', getSalesperson);
// router.post('/salespersons', createSalesperson);
router.route('/salesperson/new').post(createSalesperson);
router.put('/salespersons/:id', updateSalesperson);
module.exports = router;
