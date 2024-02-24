const query = require("../queries/user.js");
const eventQuery = require("../queries/eventQueries.js");
const validation = require("../controller/validation.js");
const excelController = require("../controller/excel.js");
const jwtauth = require("../middleware/request.js");

let controller = {
  event: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);

      if (username != undefined) {
        let getmodules = await query.getModules(username);
        let childmodules = await eventQuery.getChildModules(username, "Event");

        return res.render("eventPage", {
          module: getmodules,
          childModules: childmodules.rows,
        });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (err) {
      console.log("Error " + err.message);
      return res.redirect("/elective/error");
    }
  },

  addEvent: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);
      if (username != undefined) {
        let modules = await query.getModules(username);
        let campus = await eventQuery.getCampus();
        let acadSession = await eventQuery.getacadSession();

        return res.render("addEvent", {
          module: modules,
          campus: campus.rows,
          acadSession: acadSession.rows,
        });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (err) {
      console.log(err.message);
      return res.redirect("/elective/error");
    }
  },

  eventData: async function (req, res) {
    let username = jwtauth.verifySession(req, res);
    let user_role = jwtauth.verifySessionRole(req, res);

    try {
      if (username != null) {
        let { eventName, semester, acad_year, campus, start_date, end_date } =
          req.body;

          let campusValidate = validation.campusValidation(campus);
          let sessionValidate = validation.acadSessionValidation(res, semester);
          let acadYearValidation = validation.newAcadYearValidation(
            res,
            acad_year
          ); 

        if(eventName != undefined && start_date != undefined && end_date != undefined && campusValidate && sessionValidate && acadYearValidation ){  

        let startDate = start_date.split("T")[0];
        let endDate = end_date.split("T")[0];

        let dateValidate = new Date(startDate) < new Date(endDate);
        if (dateValidate) {
          let jsonData = JSON.stringify({
            eventName,
            semester,
            acad_year,
            campus,
            start_date,
            end_date,
            username,
          });

          if (user_role === "Role_Admin") {
            let query = await eventQuery.addEventdata(jsonData);

            console.log("query return--- ", query);

            if (query.rowCount > 0) {
              return res.json({
                status: "success",
                redirectTo: "/elective/viewEvent",
              });
            } else {
              return res.json({
                status: "error",
                message: "Failed To Create Event !!",
              });
            }
          } else {
            res.clearCookie("jwtauth");
            return res.json({
              status: "error",
              redirectTo: "/elective/loginPage",
            });
          }
        } else {
          return res.json({
            status: "error",
            message: "Invalid Date Input !!",
          });
        }
      }

      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }

    } catch (error) {
      console.log(error.message);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  viewEvent: async function (req, res) {
    try {
      let username = jwtauth.verifySession(req, res);

      if (username != undefined) {
        let getmodules = await query.getModules(username);
        let eventData = await eventQuery.getAllEventData(username);
        let campus = await eventQuery.getCampus();
        let acadSessions = await eventQuery.getacadSession();

        let dataRows = eventData.rowCount;

        return res.render("viewEvent", {
          module: getmodules,
          eventData: eventData.rows,
          campus: campus.rows,
          acadSession: acadSessions.rows,
          dataRows:dataRows
        });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (err) {
      console.log("Error " + err.message);
      return res.redirect("/elective/error");
    }
  },

  registerStudent: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);
      if (username != undefined) {
        let getmodules = await query.getModules(username);
        let campus = await eventQuery.getCampus();
        let acadSession = await eventQuery.getacadSession();

        return res.render("registerStudent", {
          module: getmodules,
          campus: campus.rows,
          acadSession: acadSession.rows,
        });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (err) {
      console.log(err.message);
      return res.redirect("/elective/error");
    }
  },

  uploadStudentData: async (req, res) => {
    try {
      console.log("File function called");
      let username = jwtauth.verifySession(req, res);
      let user_role = jwtauth.verifySessionRole(req, res);

      if (username != undefined) {
        let file = req.file;

        console.log("File found ", file);
        if (file != undefined) {
          let studentArray = [];
          let emptyStudentArray = [];

          let getData = excelController.readExcelFile(file);
          let arrLength = getData.length;
          if (arrLength > 0) {
            getData.forEach(async (data) => {
              let excelStudentUname = new String(data.Username);
              let excelFirstName = data.FirstName;
              let excelLastName = data.LastName;
              let excelSession = data.Acad_Session;
              let excelYear = data.Acad_Year;
              let excelCampus = data.Campus;
              let excelRoll = new String(data.RollNo);

              let studentUname = excelStudentUname!=undefined ? excelStudentUname.trim() : undefined;
              let studentFirstName = excelFirstName!=undefined ?  excelFirstName.trim() : undefined;
              let studentLastName = excelLastName!=undefined ? excelLastName.trim() : undefined;
              let acadSession = excelSession!=undefined ?  excelSession.trim() : undefined;
              let acadYear = excelYear!=undefined ? excelYear.trim() : undefined;
              let campus = excelCampus!=undefined ? excelCampus.trim() : undefined;
              let rollNo = excelRoll!=undefined ? excelRoll.trim() : undefined;

              let usernameValidation = studentUname!=undefined ? validation.NumberValidation(studentUname) : false;
              if (
                usernameValidation &&
                studentFirstName != undefined &&
                studentLastName != undefined &&
                acadSession != undefined &&
                acadYear != undefined &&
                campus != undefined &&
                rollNo != undefined
              ) {
                studentArray.push({
                  studentUname,
                  studentFirstName,
                  studentLastName,
                  acadSession,
                  acadYear,
                  campus,
                  rollNo,
                  username,
                });
                console.log("Array found--- ", studentArray);
              } else {
                console.log("Array not found empty");
                emptyStudentArray.push({
                  studentUname,
                  studentFirstName,
                  studentLastName,
                  acadSession,
                  acadYear,
                  campus,
                  rollNo,
                  username,
                });
              }
            });

            if (user_role === "Role_Admin") {
              let registerStudentCall = await eventQuery.registerStudentExcel({
                studentData: studentArray,
              });
              console.log(
                "registerStudentCall:::::::::::",
                registerStudentCall
              );

              if (registerStudentCall.rowCount > 0) {
                return res.json({
                  message: "Registered Students Successfully !!",
                  status: "success",
                  nonInserted: emptyStudentArray,
                });
              } else {
                return res.json({ message: "Failed To Upload File !!" });
              }
            } else {
              res.clearCookie("jwtauth");
              return res.json({
                status: "error",
                redirectTo: "/elective/loginPage",
              });
            }
          } else {
            console.log("Array not found");
            return res.json({ message: "File Cannot Be Empty !!" });
          }
        } else {
          return res.json({ status: "File Not Found !!" });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }
    } catch (err) {
      console.log(err.message);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  registerStudentManually: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);
      let user_role = jwtauth.verifySessionRole(req, res);

      if (username != undefined) {
        let {
          fname,
          lname,
          rollNo,
          campus,
          studUsername,
          acadYear,
          acadSession,
        } = req.body;

        const validationPromises = [
          validation.fnameValidation(res, fname),
          validation.lnameValidation(res, lname),
          validation.rollNoValidation(res, rollNo),
          validation.campusValidation(res, campus),
          validation.newAcadYearValidation(res, acadYear),
          validation.acadSessionValidation(res, acadSession),
          validation.UsernameValidation(res, studUsername),
        ];

        const [
          fnameVal,
          lnameVal,
          rollNoVal,
          campusVal,
          acadYearVal,
          sessionVal,
          usernameVal,
        ] = await Promise.all(validationPromises);
        console.log(
          "Validate----roll ",
          rollNoVal,
          campusVal,
          acadYearVal,
          sessionVal
        );
        let manualArray = [];

        if (
          fnameVal &&
          lnameVal &&
          rollNoVal &&
          campusVal &&
          acadYearVal &&
          sessionVal &&
          usernameVal
        ) {
          studentFirstName = fname;
          studentLastName = lname;
          studentUname = studUsername;

          console.log(
            "Validated rightly",
            fnameVal,
            lnameVal,
            rollNoVal,
            campusVal,
            acadYearVal,
            sessionVal,
            usernameVal
          );
          manualArray.push({
            studentFirstName,
            studentLastName,
            rollNo,
            campus,
            studentUname,
            acadYear,
            acadSession,
            username,
          });

          if (user_role === "Role_Admin") {
            let registerManually = await eventQuery.registerStudentExcel({
              studentData: manualArray,
            });

            if (registerManually.rowCount > 0) {
              return res.json({
                status: "success",
                message: "Student Registered Successfully !!",
              });
            } else {
              return res.json({
                status: "error",
                message: "Failed To Registered Student !!",
              });
            }
          } else {
            res.clearCookie("jwtauth");
            return res.json({
              status: "error",
              redirectTo: "/elective/loginPage",
            });
          }
        } else {
          return res.json({
            status: "error",
            message: "Invalid Credentials !!",
          });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (error) {
      console.log(error.message);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);
      let role = jwtauth.verifySessionRole(req, res);

      if (username != undefined) {
        let { eventId } = req.body;

        if (role === "Role_Admin") {
          let deleteEventId = await eventQuery.deleteEvent(eventId);
          if (deleteEventId.rowCount > 0) {
            return res.json({
              status: "success",
              message: "Event Deleted Succesfully !!",
            });
          } else {
            return res.json({ message: "Failed To Delete Event !!" });
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
      console.log(error);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  editEvent: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);
      let role = jwtauth.verifySessionRole(req, res);

      if (username != undefined) {
        let {
          eventId,
          eventName,
          campus,
          startDate,
          endDate,
          semester,
          acad_year,
        } = req.body;

        let campusValidate = validation.campusValidation(campus);
        let sessionValidate = validation.acadSessionValidation(res, semester);
        let acadYearValidation = validation.newAcadYearValidation(
          res,
          acad_year
        );

        console.log(
          "event validation ",
          campusValidate,
          sessionValidate,
          acadYearValidation,
          startDate,
          endDate
        );

        if (
          eventName != undefined &&
          campusValidate &&
          sessionValidate &&
          acadYearValidation &&
          startDate != undefined &&
          endDate != undefined
        ) {
          let start_date = startDate.split("T")[0];
          let end_date = endDate.split("T")[0];

          if (role === "Role_Admin") {
            let eventObj = {
              eventId,
              eventName,
              campus,
              start_date,
              end_date,
              semester,
              acad_year,
              username,
            };
            let upsertEvent = await eventQuery.addEventdata(eventObj);

            if (upsertEvent.rowCount > 0) {
              return res.json({
                status: "success",
                message: "Event Updated Successfully !!",
              });
            } else {
              return res.json({ message: "Failed To Update Event !!" });
            }
          } else {
            res.clearCookie("jwtauth");
            return res.json({
              status: "error",
              redirectTo: "/elective/loginPage",
            });
          }
        } else {
          return res.json({ message: `Invalid Inputs !!` });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }
    } catch (error) {
      console.log(error);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  publishEvent : async (req,res) => {

    try {

      let username = jwtauth.verifySession(req,res);
      let role = jwtauth.verifySessionRole(req,res);

      if(username != undefined){

      let {eventId} = req.body;
      if(role === 'Role_Admin'){

      let publishEvent = await eventQuery.publishEvent(eventId);
      if(publishEvent.rowCount > 0){
       return res.json({status:'success',message:'Event Published Successfully !!'})
      }else{
       return res.json({message:'Failed To Publish Event !!'})
      }  

      }else{
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" }); 
      }
      }else{
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" }); 
      }
      
    } catch (error) {
      console.log(error);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  }
};

module.exports = controller;
