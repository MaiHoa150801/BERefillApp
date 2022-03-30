const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  comment: {
    type: String,
    required: true,
  },
  reply_id: {
    type: String,
  },
  list_reply: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],

  date_created: {
    type: Date,
    default: new Date(),
  },
});
CommentSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Comment', CommentSchema);
