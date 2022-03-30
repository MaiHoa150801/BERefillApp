const mongoose = require('mongoose');

const salespersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Vui lòng nhập tên của cửa hàng"],
  },
  phone_number: {
    type: String,
    unique: [true, 'Mời nhập phone của cửa hàng'],
  },
  email: {
    type: String,
    unique: [true, 'Mời nhập email của cửa hàng'],
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // account_id: {
  //   type: mongoose.Types.ObjectId,
  //   ref: 'User',
  // },
  account_id: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  list_product: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
  ],
  logo: {
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

salespersonSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Salesperson', salespersonSchema);
