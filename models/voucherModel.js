const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    min: 6,
    max: 15,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  expiry_date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  salesperson_id: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
});
voucherSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Voucher', voucherSchema);
