const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  list_order_id: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'ListOrder',
    },
  ],
  account_id: {
    type: String,
    required: true,
  },
  voucher_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Voucher',
  },
  date_created: {
    type: Date,
    default: new Date(),
  },
  total_money: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'Chờ xác nhận',
  },
  salesperson_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Salesperson',
  },
  date_refill: {
    type: String,
    required: true,
  },
  shipAddress: {
    type: Object,
    required: true,
  },
  shipper_id: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
});
orderSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Order', orderSchema);
