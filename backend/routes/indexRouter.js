const {Router} = require("express");
const indexRouter = Router();
const {
    logInPost, 
    verifyToken, 
    signUpPagePost, 
    submitPost,
    logout
} = require("../controllers/indexController");

// Public Routes
indexRouter.post('/api/login', logInPost);
indexRouter.post('/api/sign-up', signUpPagePost);
indexRouter.get('/api/logout', logout);

// Protected Routes
indexRouter.post('/api/submit-post', verifyToken, submitPost);

module.exports = indexRouter;