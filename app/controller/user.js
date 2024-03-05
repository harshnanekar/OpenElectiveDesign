let query = require("../queries/user.js");
const { get } = require("../router/route.js");
const jwt = require("jsonwebtoken");
const jwtauth = require("../middleware/request.js");
const passwordClass = require("../middleware/password.js");
const { redisDb } = require("../config/database.js");
const mail = require("../controller/email.js");

module.exports = {
  loginPage: async function (req, res) {
    try {
      let jwtreturn = await jwtauth.verifyLogin(req.signedCookies.jwtauth, res);

      if (jwtreturn === "invalid") {
        res.render("login");
      } else {
        redisDb.set("user", jwtreturn.username, "EX", 86400);
        redisDb.set("role", jwtreturn.role[0].role_name, "EX", 86400);

        return res.redirect(`${res.locals.BASE_URL}elective/dashboard`);
      }
    } catch (err) {
      console.log("error in login ", err.message);
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },

  login: async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    console.log("request data " + req.body.username);
    console.log("Fetch api called");

    try {
      let querydata = await query.authenticateLogin(username);
      console.log("Query Data:", querydata);

      if (querydata != undefined) {
        let pass = querydata[0].password;
        let passwordVal = await passwordClass.comparePassword(pass, password);

        if (passwordVal) {
          let getUserRole = await query.getUserRole(username);
          req.session.userRole = getUserRole[0].role_name;

          console.log("Authenticated Successfully ", req.session.userRole);

          req.session.modules = querydata[0].username;

          let redisUser = querydata[0].username;
          let redisRole = getUserRole[0].role_name;
          redisDb.set("user", redisUser, "EX", 86400);
          redisDb.set("role", redisRole, "EX", 86400);

          const user = querydata[0].username;
          const secretkey = process.env.JWT_SECRETKEY;

          console.log("secretkey---- " + secretkey);
          const token = await jwt.sign(
            { username: user, role: getUserRole },
            process.env.JWT_SECRETKEY,
            { expiresIn: "1 day" }
          );

          res.cookie("jwtauth", token, {
            signed: true,
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
            httponly: true,
          });
          return res.json({
            status: "success",
            redirectTo: `${res.locals.BASE_URL}elective/dashboard`,
          });
        } else {
          console.log("Unauthenticated");
          return res.json({
            status: "error",
            redirectTo: `${res.locals.BASE_URL}elective/loginPage`,
            message: "Invalid Password!!",
          });
        }
      } else {
        console.log("Invalid username");
        return res.json({
          status: "error",
          redirectTo: `${res.locals.BASE_URL}elective/loginPage`,
          message: "Invalid Username!!",
        });
      }
    } catch (err) {
      console.log(err.message);
      return res.json({
        status: "error",
        redirectTo: `${res.locals.BASE_URL}elective/error`,
      });
    }
  },

  errorPage: async function (req, res) {
    let username = await redisDb.get("user");
    let getModules = await query.getModules(username);
    return res.render("500", { module: getModules });
  },

  dashboard: async function (req, res, next) {
    try {
      let usermodules = await redisDb.get("user");

      let getModules = await query.getModules(usermodules);
      return res.render("dashboard", { module: getModules });
    } catch (err) {
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },

  logout: async function (req, res) {
    try {
      req.session.destroy();
      res.clearCookie("jwtauth");
      redisDb.del("user");
      redisDb.del("role");

      return res.redirect(`${res.locals.BASE_URL}elective/loginPage`);
    } catch (err) {
      console.log(err.message);
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },

  checkUsernameForOtp: async (req, res) => {
    try {
      console.log("mail config");
      let { username } = req.body;

      console.log("username: " + username);
      let userDetails = await query.checkUser(username);
      if (userDetails.rowCount > 0) {
        min = Math.ceil(10000);
        max = Math.floor(99999);
        let otp = Math.floor(Math.random() * (max - min + 1) + min);

        let sendMailTo = userDetails.rows.map((data) => data.email);
        console.log("sendMailTo:: ", sendMailTo, otp);

        let subject = "Otp To Reset Password";
        let message = `Hello ${username}, your otp to reset password is ${otp}`;

        Promise.all([
          mail.sendMail(sendMailTo, subject, message),
          query.insertOtp(username, otp),
        ]).then(res.json({ status: "success", message: undefined }));
      } else {
        return res.json({ message: "*Invalid Username" });
      }
    } catch (error) {
      console.log(error);
      return res.json({
        status: "error",
        redirectTo: `${res.locals.BASE_URL}elective/error`,
      });
    }
  },

  checkOtpFromUser: async (req, res) => {
    try {
      let { username, otp } = req.body;
      let checkOtpTime = await query.checkOtpTime(username, otp);

      if (checkOtpTime.rowCount > 0) {
        return res.json({ otpStatus: true, message: checkOtpTime.rows });
      } else {
        return res.json({ otpStatus: false,message: "*Invalid Otp" });
      }
    } catch (error) {
      console.log(error);
      return res.json({
        status: "Error",
        redirectTo: `${res.locals.BASE_URL}elective/error`,
      });
    }
  }
};
