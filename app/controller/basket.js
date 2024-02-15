const basket = require("../queries/basketQueries.js");
const query = require("../queries/user.js");
const eventQuery = require("../queries/eventQueries.js");
const validation = require("../controller/validation.js");
const courseQuery = require("../queries/courseQuery.js");

module.exports = {
  addBasketPage: async (req, res) => {
    try {
      let username = req.session.modules;
      if (username != undefined) {
        let eventId = req.query.id;
        console.log("eventId ", eventId);

        let basketData = await basket.getBasketForEvent(eventId);
        let getmodules = await query.getModules(username);
        let campusData = await eventQuery.getCampus();
        console.log("campus>>> ", campusData.rowCount, basketData.rowCount);

        if (basketData.rowCount > 0) {
          return res.render("addbasket", {
            module: getmodules,
            basket: basketData.rows,
            campus: campusData.rows,
          });
        } else {
          return res.render("addbasket", {
            module: getmodules,
            basket: [],
            campus: campusData.rows,
          });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage");
      }
    } catch (error) {
      return res.redirect("/elective/error");
    }
  },

  createBasket: async (req, res) => {
    try {
      let username = req.session.modules;
      let role = req.session.userRole;

      if (username != undefined) {
        let { basketName, basketAbbr, eventId } = req.body;

        if (
          basketName != undefined &&
          basketAbbr != undefined 
        ) {
          if (role === "Role_Admin") {
            let basket_abbr = basketAbbr;

            let addbasket = await basket.insertBasket({
              basketName,
              basket_abbr,
              eventId,
              username,
            });
            if (addbasket.rowCount > 0) {
              let bsLid = addbasket.rows[0].createbasket.basketLid;
              console.log("basket added ", addbasket, bsLid);
              return res.json({
                status: "success",
                message: "Basket Created Successfully !!",
                basketLid: bsLid,
              });
            } else {
              console.log("Failed to add basket");
              return res.json({ message: "Failed To Create Basket !!" });
            }
          } else {
            res.clearCookie("jwtauth");
            return res.json({
              status: "error",
              redirectTo: "/elective/loginPage",
            });
          }
        } else {
          return res.json({ message: "Invalid Inputs !!" });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }
    } catch (error) {
        console.log('create basket ',error)
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  deleteBasket: async (req, res) => {
    try {
      let username = req.session.modules;
      let role = req.session.userRole;

      if (username != undefined) {
        let { basketId } = req.body;

        if (role === "Role_Admin") {
          let deleteBasketEvent = await basket.deleteBasketEventData(basketId);
          let deleteBasket = await basket.deleteBasketData(basketId);

          if (deleteBasketEvent.rowCount > 0 && deleteBasket.rowCount > 0) {
            return res.json({
              status: "success",
              message: "Basket Deleted Successfully !!",
            });
          } else {
            return res.json({ message: "Failed To Delete Basket !!" });
          }
        } else {
          res.clearCookie("jwtauth");
          return res.json({
            status: "error",
            redirectTo: "/elective/loginPage",
          });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }
    } catch (error) {
      console.log(error)  
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  editBasket: async (req, res) => {
    try {
      let username = req.session.modules;
      let role = req.session.userRole;

      if (username != undefined) {
        let { basket_id, basketName, basket_abbr, eventId } = req.body;

        if (
          basketName != undefined &&
          basket_abbr != undefined 
        ) {
          if (role === "Role_Admin") {
            let basketData = await basket.insertBasket({
              basket_id,
              basket_abbr,
              basketName,
              username,
              eventId,
            });
            if (basketData.rowCount > 0) {
              return res.json({
                status: "success",
                message: "Basket Edited Successfully !!",
              });
            } else {
              return res.json({ message: "Failed To Edit Basket" });
            }
          } else {
            res.clearCookie("jwtauth");
            return res.json({
              status: "error",
              redirectTo: "/elective/loginPage",
            });
          }
        } else {
          return res.json({ message: "Invalid Inputs !!" });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }
    } catch (error) {
      console.log("basket error ", error);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  basketCourseConfig: async (req,res) => {

    try{

    let username = req.session.modules;
    if(username != undefined){

    let getModules = await query.getModules(username);    
    let getAllCourse = await courseQuery.getAllCourses(username);
    let getAllBaskets = await basket.getAllBaskets(username);
    let displayBaskets = await basket.displayAllBaskets();
    
    return res.render('basketCourseConfig',{module:getModules,course:getAllCourse.rows,baskets:getAllBaskets.rows,dispBasket:displayBaskets.rows});     

    }else{
    return res.redirect('/elective/loginPage');    
    }    

    }catch(error){
     console.log(error);
     return res.redirect("/elective/error");
    }
  }
};
