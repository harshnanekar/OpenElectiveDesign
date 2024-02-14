const express = require("express");
const app = express();
const { pgPool,redisDb } = require("./app/config/database.js");
const indexRouter = require("./app/router/route.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");

pgPool.connect();
redisDb.connect();

require("dotenv").config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "app/views/pages");


app.use(cookieParser("a98dbd38-68c4-4d74-b36a-2e5bbdc7ecdd"));

app.use(
  session({
    secret: "cvekg-cvekvgwk-vwvgw-vwgv-cwhv",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use("/elective", indexRouter);

app.listen(8080);
