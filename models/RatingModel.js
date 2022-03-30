const mongoose = require('mongoose');

const RatingProductSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
  },
  star: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  list_image: {
    type: Array,
    default: [],
  },
  account_id: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
});
RatingProductSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('RatingProduct', RatingProductSchema);
