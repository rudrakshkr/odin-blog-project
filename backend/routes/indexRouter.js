const {Router} = require("express");
const indexRouter = Router();
const {
    logInPost, 
    verifyToken, 
    signUpPagePost, 
    getPosts,
    submitPost,
    togglePost,
    logout
} = require("../controllers/indexController");

// Public Routes
indexRouter.post('/api/login', logInPost);
indexRouter.post('/api/sign-up', signUpPagePost);
indexRouter.get('/api/logout', logout);

// Protected Routes
indexRouter.post('/api/submit-post', verifyToken, submitPost);
indexRouter.get('/api/get-posts', verifyToken, getPosts);
indexRouter.post('/api/posts/:postId/toggle', verifyToken, togglePost);

module.exports = indexRouter;