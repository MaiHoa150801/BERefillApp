const mongoose = require('mongoose');

const ShipperMapSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
  },
});
ShipperMapSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('ShipperMap', ShipperMapSchema);
