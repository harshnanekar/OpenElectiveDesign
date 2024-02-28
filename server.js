const express = require("express");
const app = express();
const { pgPool,redisDb } = require("./app/config/database.js");
const indexRouter = require("./app/router/route.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nocache = require('nocache');

pgPool.connect();
redisDb.connect();

require("dotenv").config();

app.use((req, res, next) => {
  res.locals.BASE_URL = process.env.BASE_URL;
  next();
})


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "app/views/pages");


app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(nocache());

app.use('/elective',indexRouter);

app.use("*",function(req, res) { 
  return res.status(404).render('404');
 });


app.listen(8080);
