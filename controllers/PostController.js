const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const Post = require('../models/PostModel');
const path = require('path');
const Resize = require('../root/Resize');
const CommentModel = require('../models/CommentModel');

exports.getAllPost = asyncErrorHandler(async (req, res, next) => {
  const listPost = await getPosts(req);
  res.status(200).json({
    success: true,
    listPost,
  });
});
exports.getPost = asyncErrorHandler(async (req, res, next) => {
  const post = await getPost(req);
  res.status(200).json({
    success: true,
    post,
  });
});
const getPosts = async (req) => {
  const listPost = await Post.find()
    .populate({
      model: 'Comment',
      path: 'list_comment',
    })
    .populate({
      model: 'Post',
      path: 'share_id',
      populate: {
        model: 'Comment',
        path: 'list_comment',
        populate: {
          model: 'User',
          path: 'account_id',
        },
      },
      populate: {
        model: 'User',
        path: 'account_id',
      },
    })
    .populate({
      model: 'User',
      path: 'account_id',
    });
  if (req.io) await req.io.emit(`posts`, listPost);
  return listPost;
};
const getPost = async (req) => {
  const post = await Post.findById(req.params.id)
    .populate({
      model: 'Comment',
      path: 'list_comment',
      populate: {
        model: 'User',
        path: 'account_id',
      },
    })
    .populate({
      model: 'Post',
      path: 'share_id',
      populate: {
        model: 'Comment',
        path: 'list_comment',
        populate: {
          model: 'User',
          path: 'account_id',
        },
      },
      populate: {
        model: 'User',
        path: 'account_id',
      },
    })
    .populate({
      model: 'User',
      path: 'account_id',
    });
  if (req.io) await req.io.emit(`posts/${req.params.id}`, post);
  return post;
};
exports.createPost = asyncErrorHandler(async (req, res, next) => {
  let images = [''];
  if (req.body.list_image) {
    const imagePath = 'public/images/post';
    images = await Promise.all(
      req.body.list_image.map(async (e) => {
        var buffer = Buffer.from(e.data, 'base64');
        const fileUpload = new Resize(imagePath, e.name);
        const fileUrl = await fileUpload.save(buffer);
        return 'http://refillpointapp.cleverapps.io/images/post/' + e.name;
      })
    );
  }
  req.body.list_image = images;
  req.body.account_id = req.user.id;
  const post = await Post.create(req.body);
  const listPost = await getPosts(req);
  res.status(200).json({
    success: true,
    post,
  });
});
exports.sharePost = asyncErrorHandler(async (req, res, next) => {
  req.body.account_id = req.user.id;
  const oldPost = await Post.findById(req.body.share_id);
  oldPost.share = oldPost.share + 1;
  await oldPost.save();
  const post = await Post.create(req.body);
  const listPost = await getPosts(req);
  res.status(200).json({
    success: true,
    post,
  });
});
exports.updateLikePost = asyncErrorHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post.list_account_like.indexOf(req.user.id) == -1) {
    post.like = post.like + 1;
    post.list_account_like.push(req.user.id);
  } else {
    post.list_account_like.splice(
      post.list_account_like.indexOf(req.user.id),
      1
    );
    post.like = post.like - 1;
  }
  await post.save();
  await getPosts(req);
  await getPost(req);
  res.status(200).json({
    success: true,
    post,
  });
});
exports.deletePost = asyncErrorHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler('Không tìm thấy bài post!', 404));
  }
  if (post.account_id.toString() !== req.user.id && req.user.role != 'admin') {
    return next(new ErrorHandler('Không có quyền xóa bài viết!', 401));
  }
  await Post.findByIdAndDelete(req.params.id);
  const listPost = await getPosts(req);
  res.status(200).json({
    success: true,
  });
});
exports.updatePost = asyncErrorHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler('Không tìm thấy bài post!', 404));
  }
  if (post.account_id.toString() !== req.user.id) {
    return next(new ErrorHandler('Không có quyền cập nhật bài viết!', 401));
  }
  let images = [];
  if (req.body.list_image.length > 0) {
    const imagePath = 'public/images/post';
    images = await Promise.all(
      req.body.list_image.map(async (e) => {
        if (e.data) {
          var buffer = Buffer.from(e.data, 'base64');
          const fileUpload = new Resize(imagePath, e.name);
          const fileUrl = await fileUpload.save(buffer);
          return 'http://refillpointapp.cleverapps.io/images/post/' + e.name;
        }
        return e.uri;
      })
    );
  }
  req.body.list_image = images;
  const postt = await Post.findByIdAndUpdate(req.params.id, req.body);
  await getPost(req);
  const listPost = await getPosts(req);
  res.status(200).json({
    success: true,
  });
});

exports.updateComment = asyncErrorHandler(async (req, res, next) => {
  const comment = await CommentModel.findById(req.params.cmtId);
  if (!comment) {
    return next(new ErrorHandler('Không tìm thấy bình luận!', 404));
  }
  if (comment.account_id.toString() !== req.user.id) {
    return next(new ErrorHandler('Không có quyền cập nhật bình luận!', 401));
  }
  comment.comment = req.body.comment;
  await comment.save();
  await getPost(req);
  res.status(200).json({
    success: true,
  });
});

exports.deleteComment = asyncErrorHandler(async (req, res, next) => {
  const comment = await CommentModel.findById(req.params.cmtId);
  if (!comment) {
    return next(new ErrorHandler('Không tìm thấy bình luận!', 404));
  }
  if (comment.account_id.toString() !== req.user.id) {
    return next(new ErrorHandler('Không có quyền cập nhật bình luận!', 401));
  }
  await CommentModel.findByIdAndDelete(req.params.cmtId);
  const post = await Post.findById(req.params.id);
  const index = post.list_comment.indexOf(req.params.cmtId);
  post.list_comment.splice(index, 1);
  await post.save();
  await getPost(req);
  res.status(200).json({
    success: true,
  });
});
exports.updateSharePost = asyncErrorHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  post.share = post.share + 1;
  await post.save();
  res.status(200).json({
    success: true,
    post,
  });
});
exports.commentPost = asyncErrorHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  req.body.account_id = req.user.id;
  const comment = await CommentModel.create(req.body);
  post.list_comment.push(comment.id);
  await post.save();
  await getPost(req);
  res.status(200).json({
    success: true,
    post,
  });
});

exports.replyCommentPost = asyncErrorHandler(async (req, res, next) => {
  const comment = await CommentModel.create(req.body);
  const oldComment = await CommentModel.findById(req.body.reply_id);
  oldComment.list_reply.push(comment.id);
  await oldComment.save();
  res.status(200).json({
    success: true,
    oldComment,
  });
});

exports.getReplyCommentPost = asyncErrorHandler(async (req, res, next) => {
  const comment = await CommentModel.findById(req.params.id).populate({
    model: 'Comment',
    path: 'list_reply',
  });
  res.status(200).json({
    success: true,
    comment,
  });
});
