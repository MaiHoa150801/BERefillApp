const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
  },
  unit_price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá trị sản phẩm'],
  },
  sale_price: {
    type: Number,
    default: 0,
  },
  measure: {
    type: String,
    required: [true, 'Vui lòng nhập đo lường sản phẩm'],
  },
  trademark: {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập hãng sản phẩm'],
    },
    logo: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm'],
  },
  list_image: [
    {
      type: String,
      required: true,
    },
  ],
  type_product_id: {
    type: Number,
    required: [true, 'Vui lòng nhập id sản phẩm'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
productSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Product', productSchema);
