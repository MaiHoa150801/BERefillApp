const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
  },
  list_image: {
    type: Array,
    default: [],
  },
  date_created: {
    type: Date,
    default: new Date(),
  },
  share_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Post',
  },
  like: {
    type: Number,
    default: 0,
  },
  list_account_like: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  share: {
    type: Number,
    default: 0,
  },
  list_account_share: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  list_comment: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
});
PostSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Post', PostSchema);
