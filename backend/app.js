require("dotenv").config({path: ".env"});
const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const path = require("node:path");
// const indexRouter = require("./routes/indexRouter");

const CustomNotFoundError = require('./errors/CustomNotFoundError.js');

const prisma = require("./lib/prisma.js")

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.get("/", (req, res) => res.send("HELLO WORLDDDDDD"))

app.use((err, req, res, next) => {
  if (!(err instanceof CustomNotFoundError)) {
    console.error(err);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).send(`${err.name}: ${err.message}`);
});

app.listen(3000, (error) => {
    if(error) {
        throw error;
    }
    console.log("Listening on PORT 3000");
})