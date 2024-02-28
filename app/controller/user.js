let query = require("../queries/user.js");
const { get } = require("../router/route.js");
const jwt = require("jsonwebtoken");
const jwtauth = require("../middleware/request.js");
const passwordClass = require('../middleware/password.js');

module.exports = {
  loginPage: async function (req, res) {
    try {
      let jwtreturn = await jwtauth.verifyLogin(req.signedCookies.jwtauth, res);

      if (jwtreturn === "invalid") {
        res.render("login");
      } else {
        req.session.modules = jwtreturn.username;
        req.session.userRole = jwtreturn.role[0].role_name;
        console.log(
          "username and role ",
          req.session.modules,
          " ",
          req.session.userRoles
        );

        return res.redirect(`${res.locals.BASE_URL}elective/dashboard`);
      }
    } catch (err) {
      console.log(err.message);
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
      return res.json({ status: "Error", redirectTo: `${res.locals.BASE_URL}elective/error` });
    }
  },

  errorPage: async function (req, res) {
    let username = jwtauth.verifySession(req, res);
    let getModules = await query.getModules(username);
    return res.render("500", { module: getModules });
  },

  dashboard: async function (req, res, next) {
    try {
      let usermodules = req.session.modules;

      if (usermodules != null) {
        let getModules = await query.getModules(usermodules);
        return res.render("dashboard", { module: getModules });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect(`${res.locals.BASE_URL}elective/loginPage#sessionTimeout`);
      }
    } catch (err) {
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },

  logout: async function (req, res) {
    try {
      req.session.destroy();
      res.clearCookie("jwtauth");

      return res.redirect(`${res.locals.BASE_URL}elective/loginPage`);
    } catch (err) {
      console.log(err.message);
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },
};
