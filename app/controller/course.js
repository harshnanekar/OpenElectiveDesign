const userQuery = require("../queries/user.js");
const query = require("../queries/eventQueries.js");
const excel = require("../controller/excel.js");
const courseQuery = require("../queries/courseQuery.js");
const validation = require("../controller/validation.js");
const programQuery = require("../queries/programQueries.js");
const Validation = require("../controller/validation.js");
const jwtauth = require("../middleware/request.js");


module.exports = {
  addCourses: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);

      if (username != undefined) {
        let getmodules = await userQuery.getModules(username);
        let campus = await query.getCampus();
        return res.render("course", {
          module: getmodules,
          campus: campus.rows,
        });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/elective/error");
    }
  },

  insertCourseViaExcel: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      let role = jwtauth.verifySessionRole(req,res);

      if (username != undefined) {
        let file = req.file;
        if (file != undefined) {
           let subjectColumn = 'Subject_Name';
           let departmentColumn = 'Department_Name';
           let campusColumn = 'Campus';
           let batchColumn = 'No_Of_Batches';
           let maxcapacityColumn = 'Max_Capacity_Per_Batch';
           let mincapacityColumn = 'Min_Capacity_Per_Batch';
           let openColumn = 'Open_To_All_Programs';
        
           let courseExcel= {subjectColumn,departmentColumn,campusColumn,batchColumn,maxcapacityColumn,mincapacityColumn,openColumn};
           let excelData = excel.readExcelFile(file);
      
          if (excelData.length > 0) {
           
           let excelHeaderKeys = excelData[0];
           let excelHeader =Object.keys(excelHeaderKeys);

           for (let data of excelHeader) {
            if (!Object.values(courseExcel).includes(data)) {
                return res.json({ status: 'fileError', message: 'Malformed Excel File !!' });
            }
          }

            excelData.forEach(async (data) => {
              let subName = new String(data.Subject_Name);
              let deptName = new String(data.Department_Name);
              let campusName = new String(data.Campus);
              let batches = new String(data.No_Of_Batches);
              let maxCapacity = new String(data.Max_Capacity_Per_Batch);
              let minCapacity =new String(data.Min_Capacity_Per_Batch);
              let openToPrograms = new String(data.Open_To_All_Programs);

              let subjectName = subName ? subName.trim() : undefined;
              let departMentName = deptName ? deptName.trim() : undefined;
              let campus = campusName ? campusName.trim() : null;
              let batchNo = batches ? batches.trim() : undefined;
              let maxCapacityPerBatch = maxCapacity
                ? maxCapacity.trim()
                : undefined;
              let minCapacityperBatch = minCapacity
                ? minCapacity.trim()
                : undefined;  
              let openToAllPrograms = openToPrograms
                ? openToPrograms.trim()
                : undefined;
              let openPrograms;  

              let departmentValidation = departMentName ? Validation.alphabetValidation(departMentName) : false;
              let campusValidation = campus ? Validation.campusValidation(campus) : false ;
              let batchValidation = batchNo ? Validation.NumberValidation(batchNo) : false;
              let maxValidation = maxCapacityPerBatch ? Validation.NumberValidation(maxCapacityPerBatch) : false;
              let minValidation = minCapacityperBatch ? Validation.NumberValidation(minCapacityperBatch) : false;

              if (
                subjectName != undefined &&
                departmentValidation &&
                batchValidation &&
                maxValidation &&
                minValidation &&
                openToAllPrograms != undefined
              ) {
                openPrograms = openToAllPrograms === "Yes" ? "Y" : "N";

                if (role === "Role_Admin") {
                  console.log("course campus ",campus)
                  let insertCourseQuery = await courseQuery.insertCourse(
                    subjectName,
                    departMentName,
                    batchNo,
                    maxCapacityPerBatch,
                    minCapacityperBatch,
                    campus,
                    openPrograms,
                    username
                  );
                  console.log("subject ids of excel", insertCourseQuery.rows);
                  let subjectArrayId = insertCourseQuery.rows;

                  let courseArray = subjectArrayId.map((arr) => ({
                    subjectId: arr.sub_id,
                    username: username,
                  }));

                  if (openPrograms === "Y") {
                    let insertCoursePrograms =
                      courseQuery.subjectProgram(courseArray);

                    if (insertCoursePrograms != undefined) {
                      return res.json({
                        status: "success",
                        message: "Course Uploaded Successfully !!",
                      });
                    } else {
                      return res.json({
                        message: "Error, Failed To Add Programs !!",
                      });
                    }
                  } else {
                    return res.json({
                      status: "success",
                      message: "Course Uploaded Successfully !!",
                    });
                  }
                } else {
                  res.clearCookie("jwtauth");
                  return res.json({
                    status: "error",
                    redirectTo: "/elective/loginPage",
                  });
                }
              }else{
                return res.json({message:'Invalid Input Fields !!'})
              }
            });
          } else {
            console.log("Array Not Found");
            return res.json({ message: "File Should Not Be Empty !!" });
          }
        } else {
          return res.json({ message: "File Not Found" });
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

  getAllCourses: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      if (username != undefined) {
        let courseData = await courseQuery.getCourses(username);

        if (courseData.rowCount > 0) {
          return res.json({ courseData: courseData.rows });
        } else {
          return res.json({ courseData: [] });
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

  insertCourseManually: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      let role = jwtauth.verifySessionRole(req,res);

      if (username != undefined) {
        let {
          subjectName,
          department,
          batches,
          batchCapacity,
          batchMinCapacity,
          campus,
          radioTypeValue,
        } = req.body;
        let subjectValidation = subjectName.length > 0 ? true : false;
        let departmentValidation = validation.departmentValidator(department);
        let batchValidation = validation.batchValidater(batches);
        let batchCapacityValidation =
          validation.batchCapacityValidater(batchCapacity);
        let batchMinValidation = validation.batchMinValidator(batchMinCapacity);

        if (
          subjectValidation &&
          departmentValidation &&
          batchValidation &&
          batchCapacityValidation &&
          batchMinValidation
        ) {
          let radioYesNoValue = radioTypeValue === "Yes" ? "Y" : "N";

          if (role === "Role_Admin") {
            let insertCourse = await courseQuery.insertCourse(
              subjectName,
              department,
              batches,
              batchCapacity,
              batchMinCapacity,
              campus,
              radioYesNoValue,
              username
            );
            let subjectArrayId = insertCourse.rows;

            let courseArray = subjectArrayId.map((arr) => ({
              subjectId: arr.sub_id,
              username: username,
            }));

            if (radioYesNoValue === "Y") {
              let insertCoursePrograms =
                courseQuery.subjectProgram(courseArray);

              if (insertCoursePrograms != undefined) {
                return res.json({
                  status: "success",
                  radioType: "Yes",
                  message: "Course Uploaded Successfully !!",
                });
              } else {
                return res.json({
                  message: "Error, Failed To Add Programs !!",
                });
              }
            } else {
              return res.json({
                status: "success",
                redirectTo:
                  "/elective/programList?id=" + courseArray[0].subjectId,
                radioType: "No",
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
          return res.json({ message: "Invalid Inputs !!" });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }
    } catch (error) {
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  allocatePrograms: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      let role = jwtauth.verifySessionRole(req,res);

      if (username != undefined) {
        let { programArray } = req.body;
        console.log("program array::: ", programArray);

        if (role === "Role_Admin") {
          const promises = programArray.map(async (arr) => {
            courseQuery.allocateCoursePrograms(
              arr.subjectId,
              arr.programId,
              username
            );
          });

          Promise.all(promises)
            .then(() => {
              return res.json({
                status: "success",
                message: "Programs Allocated Succesfully !!",
              });
            })
            .catch((error) => {
              return res.json({
                status: "error",
                redirectTo: "/elective/error",
              });
            });
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
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  commonCourseDelete: (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      let role = jwtauth.verifySessionRole(req,res);

      if (username != undefined) {
        let { courseArray } = req.body;

        if (role === "Role_Admin") {
          courseArray.forEach(async (course) => {
            await courseQuery.deleteCourseMapping(course);
            await courseQuery.deleteCourse(course);
          });

          return res.json({
            status: "success",
            message: "Course deleted Successfully !!",
          });
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
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  getAllCoursePrograms: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      if (username != undefined) {
        let { subId } = req.body;
        let coursePrograms = await courseQuery.getAllCourseProgram(subId);

        if (coursePrograms.rowCount > 0) {
          return res.json({ coursePrograms: coursePrograms.rows });
        } else {
          let allPrograms = await programQuery.getAllProgramsList(username);
          return res.json({ coursePrograms: allPrograms.rows });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({ status: "error", redirectTo: "/elective/loginPage" });
      }
    } catch (error) {
      console.log("programs error ", error);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  editCourse: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      let role = jwtauth.verifySessionRole(req,res);

      if (username != undefined) {
        console.log("function called");
        let {
          subjectId,
          subName,
          deptName,
          batch,
          capacity,
          minBatch,
          campus,
          programs,
        } = req.body;

        let departmentValidation = Validation.departmentValidator(deptName);
        let capacityValidation = Validation.batchCapacityValidater(capacity);
        let batchValidation = Validation.batchValidater(batch);
        let minBatchValidation =Validation.batchMinValidator(minBatch);

        console.log(
          "subid>>>>> ",
          subjectId,
          departmentValidation,
          capacityValidation,
          batchValidation
        );

        console.log("programs >>>>>>> ", JSON.stringify(programs));
        if (
          subName != undefined &&
          departmentValidation &&
          batchValidation &&
          capacityValidation &&
          minBatchValidation &&
          programs.length > 0
        ) {
          if (role === "Role_Admin") {
            let insertCourse = await courseQuery.updateCourse(
              subName,
              deptName,
              batch,
              capacity,
              minBatch,
              campus,
              username,
              subjectId
            );
            let checkPrograms = await courseQuery.getAllCourseProgram(
              subjectId
            );
            let upsertPrograms;
            let programArray = [];
            let placeholders;
            let val;

            console.log("course count ", checkPrograms);

            if (checkPrograms.rowCount > 0) {
              for (let i = 0; i < programs.length; i++) {
                let checkCourseWithProgram =
                  await courseQuery.checkCourseWithProgram(
                    subjectId,
                    programs[i]
                  );
                let getPrgId = await courseQuery.getProgramId(
                  programs[i],
                  username
                );
                let programId = await getPrgId.rows[0].program_id;
                programArray.push(programId);

                if (checkCourseWithProgram.rowCount > 0) {
                  val = true;
                } else {
                  upsertPrograms = await courseQuery.allocateCoursePrograms(
                    subjectId,
                    programId,
                    username
                  );
                }
              }

              placeholders = programArray
                .map((id, index) => `$${index + 2},`)
                .join("");
              placeholders = placeholders.substring(0, placeholders.length - 1);

              upsertPrograms =
                val === true
                  ? courseQuery.deleteCourseProgram(
                      subjectId,
                      programArray,
                      placeholders
                    )
                  : undefined;
            } else {
              for (let i = 0; i < programs.length; i++) {
                let getPrgId = await courseQuery.getProgramId(
                  programs[i],
                  username
                );
                let programId = getPrgId.rows[0].program_id;

                console.log("prg id ", programId);
                upsertPrograms = await courseQuery.allocateCoursePrograms(
                  subjectId,
                  programId,
                  username
                );
              }
            }

            if (
              (insertCourse.rowCount > 0 && upsertPrograms.rowCount > 0) ||
              upsertPrograms != undefined
            ) {
              return res.json({
                status: "success",
                message: "Course Updated SuccessFully !!",
              });
            } else {
              return res.json({ message: "Failed To Upload Course !! " });
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
      console.log("error in course programs ", error);
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },

  deleteCourse: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req,res);
      let role = jwtauth.verifySessionRole(req,res);

      console.log('delete api called')

      if (username != undefined) {
        if (role === "Role_Admin") {
          let { subjectId } = req.body;
          let deleteCourseProgram = await courseQuery.deleteCourseMapping(
            subjectId
          );
          let deleteCourse = await courseQuery.deleteCourse(subjectId);

          if (deleteCourseProgram.rowCount > 0 && deleteCourse.rowCount > 0) {
            return res.json({
              status: "success",
              message: "Course Deleted Successfully !!",
            });
          } else {
            return res.json({ message: "Failed To Delete Course" });
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
    } catch {
      return res.json({ status: "error", redirectTo: "/elective/error" });
    }
  },
};
