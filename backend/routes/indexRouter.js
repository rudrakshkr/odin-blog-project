const {Router} = require("express");
const indexRouter = Router();
const {
    logInPost, 
    verifyAdmin,
    verifyToken, 
    signUpPagePost,
    getPosts,
    submitPost,
    togglePost,
    getPostById,
    getUserById,
    getPostBySlug,
    editPostPut,
    deletePost,
    postComment,
    getComments,
    getAllComments,
    deleteComment,
    logout
} = require("../controllers/indexController");

// Upload Middleware
const uploadMiddleware = require("../uploadMiddleware");

// Initialise the middleware and pass folder name as argument
const upload = uploadMiddleware("uploads")


// --------------------------------------- ROUTES -------------------------------------------------------

// Public Routes
indexRouter.post('/api/login', logInPost);
indexRouter.post('/api/sign-up', signUpPagePost);
indexRouter.get('/api/logout', logout);

// Admin and Token Protected Routes
indexRouter.post('/api/submit-post', verifyToken, verifyAdmin, upload.single('postCoverImage'), submitPost);
indexRouter.get('/api/get-posts', getPosts);
indexRouter.post('/api/posts/:postId/toggle', verifyToken, verifyAdmin, togglePost);
indexRouter.put('/api/:postId/edit-post', verifyToken, verifyAdmin, upload.single('postCoverImage'), editPostPut);
indexRouter.delete('/api/:postId/delete-post', verifyToken, verifyAdmin, deletePost);
indexRouter.get('/api/getAllComments', verifyToken, verifyAdmin, getAllComments);
indexRouter.delete('/api/:commentId/delete-comment', verifyToken, verifyAdmin, deleteComment);

// Frontend Routes
indexRouter.get('/api/:userId/getUserById', getUserById);
indexRouter.get('/api/:postId/getPostById', getPostById);
indexRouter.get('/api/:postSlug/getPostBySlug', getPostBySlug);
indexRouter.get('/api/post/:postId/getComments', getComments);

// Token Protected Routes
indexRouter.post('/api/author/:userId/post/:postId/post-comment', verifyToken, postComment);

module.exports = indexRouter;