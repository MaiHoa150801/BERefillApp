const mongoose = require('mongoose');

const RefillPointSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  score: {
    type: Number,
    default: 0,
  },
});
RefillPointSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('RefillPoint', RefillPointSchema);
