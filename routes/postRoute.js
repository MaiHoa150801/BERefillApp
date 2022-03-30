const express = require('express');
const { socketIOMiddleware } = require('../app');
const {
  createPost,
  updateLikePost,
  commentPost,
  getAllPost,
  replyCommentPost,
  getReplyCommentPost,
  deletePost,
  updatePost,
  getPost,
  updateComment,
  deleteComment,
  sharePost,
} = require('../controllers/PostController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const router = express.Router();
router.get('/post', getAllPost);
router.post('/post', isAuthenticatedUser, socketIOMiddleware, createPost);
router.post('/post/share', isAuthenticatedUser, socketIOMiddleware, sharePost);
// router.put('/post', isAuthenticatedUser, socketIOMiddleware, createPost);
router.post(
  '/updateLike/:id',
  isAuthenticatedUser,
  socketIOMiddleware,
  updateLikePost
);
router.put('/post/:id', isAuthenticatedUser, socketIOMiddleware, updatePost);
router.delete('/post/:id', isAuthenticatedUser, socketIOMiddleware, deletePost);
router.get('/post/:id', isAuthenticatedUser, getPost);
router.post(
  '/post/:id/comment',
  isAuthenticatedUser,
  socketIOMiddleware,
  commentPost
);
router.put(
  '/post/:id/comment/:cmtId',
  isAuthenticatedUser,
  socketIOMiddleware,
  updateComment
);
router.delete(
  '/post/:id/comment/:cmtId',
  isAuthenticatedUser,
  socketIOMiddleware,
  deleteComment
);
router.post('/post/replycomment', replyCommentPost);
router.get('/post/getreplycomment/:id', getReplyCommentPost);
module.exports = router;
