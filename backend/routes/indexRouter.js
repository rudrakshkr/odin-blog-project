const {Router} = require("express");
const indexRouter = Router();
const {logInPost, verifyToken} = require("../controllers/indexController");

indexRouter.post('/login', logInPost);


module.exports = indexRouter;