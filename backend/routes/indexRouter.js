const {Router} = require("express");
const indexRouter = Router();
const {logInPost, verifyToken, signUpPagePost, logout} = require("../controllers/indexController");

// Public route
indexRouter.post('/login', logInPost);
indexRouter.post('/sign-up', signUpPagePost);
indexRouter.get('/logout', logout);

module.exports = indexRouter;