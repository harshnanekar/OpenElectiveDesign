const studentQuery = require('../queries/studentQueries.js');
const userQuery = require("../queries/user.js");
const validationController = require("../controller/validation.js");
const {redisDb} = require("../config/database.js");

module.exports = {
  viewStudentEvents: async (req, res) => {
    try {
        let username = await redisDb.get('user');
        let getStudentEvent = await studentQuery.getStudentEvent(username);
        let getmodules = await userQuery.getModules(username);

        return res.render("viewStudentEvent", {
          module: getmodules,
          event: getStudentEvent.rows,
        });
    } catch (error) {
      console.log(error.message);
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },

  startCourseSelection: async (req, res) => {
    try {
      let username = await redisDb.get('user');
        let eventId = req.query.id;

        console.log(eventId, username);
        let displayBasket = await studentQuery.displayBasket(eventId, username);
        let showYearBackSubjects = await studentQuery.showYearBackSubjects(
          username,
          eventId
        );
        console.log('showyearbacksubjects ',JSON.stringify(showYearBackSubjects))
        let getModules = await userQuery.getModules(username);

        return res.render("selectBasket", {
          module: getModules,
          showBasket: displayBasket.rows,
          yearBackSubjects: showYearBackSubjects.rows,
        });
    } catch (error) {
      console.log(error.message);
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },

  insertStudentCourses: async (req, res) => {
    try {
      let username = await redisDb.get('user');
    
        let { eventLid, timeString, courseArray, userLid, basketLid } =
          req.body;
        let basketObj = {
          eventLid,
          timeString,
          courseArray,
          userLid,
          basketLid,
        };
        console.log(
          'basket data::::::::::::: ',
          JSON.stringify({
            eventLid,
            timeString,
            courseArray,
            userLid,
            basketLid,
          })
        );

        let redisData = await redisDb.set(
          "basketData",
          JSON.stringify(basketObj),
          { EX: 2592000 }
        );
        let insertStudentBasket = await studentQuery.insertStudentCourse(
          JSON.stringify(basketObj)
        );

        let nextBasketData = insertStudentBasket.rows;
<<<<<<< HEAD
       
=======
        console.log('next basket data ',JSON.stringify(nextBasketData))
>>>>>>> e511f5294962b4c78032e97c01d7910aea589ff5
        let yearBackSubjects = await studentQuery.showYearBackSubjects(
          username,
          eventLid
        );

        if (insertStudentBasket.rowCount > 0) {
          console.log(insertStudentBasket);
          return res.json({
            status: "success",
            basketData: nextBasketData,
            yearBackSubjects: yearBackSubjects.rows,
          });
        } else {
          let redisBasketData = await redisDb.get("basketData");
          await studentQuery.insertStudentCourse(
            JSON.stringify(redisBasketData)
          );
          return res.json({ message: "Failed to insert !!" });
        }
    } catch (error) {
      console.log(error.message);
      return res.json({ status: "Error", redirectTo: `${res.locals.BASE_URL}elective/error` });
    }
  },

  viewStudentElectedEvents: async (req, res) => {
    try {
        let username = await redisDb.get('user');
    
        let eventId = req.query.id;
        let getModules = await userQuery.getModules(username);
        let viewElectedStudentBasket =
          await studentQuery.viewStudentElectedBasket(eventId,username);
          console.log(JSON.stringify(viewElectedStudentBasket.rows));

        return res.render("ViewAllocatedEvents", {
          module: getModules,
          electedEvent: viewElectedStudentBasket.rows,
        });
    } catch (error) {
      console.log(error.message);
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  },

  viewElectedEvents: async (req,res) => {
    try {

     let username = await redisDb.get('user');

     let electedEvents = await studentQuery.viewStudentElectedEvent(username); 
     let rowlength = electedEvents.length;
     let getModules = await userQuery.getModules(username);
     return res.render('viewElectedEvent',{module:getModules,event:electedEvents.rows,dataRows:rowlength});

    } catch (error) {
      console.log(error.message);
      return res.redirect(`${res.locals.BASE_URL}elective/error`);
    }
  }
};