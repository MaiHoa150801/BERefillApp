const mongoose = require('mongoose');

const userVoucherSchema = new mongoose.Schema({
  account_id: {
    type: String,
    required: true,
  },
  list_voucher_id: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Voucher',
    },
  ],
  list_voucher_used: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Voucher',
    },
  ],
});
userVoucherSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('UserVoucher', userVoucherSchema);
