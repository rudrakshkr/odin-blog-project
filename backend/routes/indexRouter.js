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
    editPostPut,
    deletePost,
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

// Protected Routes
indexRouter.post('/api/submit-post', verifyToken, verifyAdmin, upload.single('postCoverImage'), submitPost);
indexRouter.get('/api/get-posts', verifyToken, getPosts);
indexRouter.post('/api/posts/:postId/toggle', verifyToken, togglePost);
indexRouter.get('/api/:postId/getPostById', verifyToken, getPostById);
indexRouter.put('/api/:postId/edit-post', verifyToken, verifyAdmin, upload.single('postCoverImage'), editPostPut);
indexRouter.delete('/api/:postId/delete-post', verifyToken, verifyAdmin, deletePost);

module.exports = indexRouter;