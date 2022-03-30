const mongoose = require('mongoose');

const trademarkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  list_type: [
    {
      type: String,
    },
  ],
});
trademarkSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Trademark', trademarkSchema);
