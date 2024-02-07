const userQuery = require('../queries/user.js')
const query = require('../queries/eventQueries.js')
const excel = require('../controller/excel.js');
const courseQuery = require('../queries/courseQuery.js');
const validation = require('../controller/validation.js');

module.exports = {

addCourses:async (req,res) => {

try{
 
 let username = req.session.modules;
 
 if(username != undefined){
   
 let getmodules = await userQuery.getModules(username);
 let campus = await query.getCampus();
 return res.render('course',{module:getmodules,campus:campus.rows});

 }else{
 res.clearCookie('jwtauth');
 return res.redirect("/elective/loginPage#sessionTimeout");
 }

}catch(error){
 console.log(error);   
 return res.redirect("/elective/error");  
}

},

insertCourseViaExcel:async (req,res) => {

try{

let username = req.session.modules;
let role = req.session.userRole;

if(username != undefined){

let file = req.file;    
if(file != undefined){

let excelData = excel.readExcelFile(file);
let emptyArray = [];

if(excelData.length > 0){
excelData.forEach(async data => {

let subName = data.Subject_Name;
let deptName = data.Department_Name;
let campusName = data.Campus;
let batches = new String(data.No_Of_Batches);
let maxCapacity = new String(data.Max_Capacity_Per_Batch);
let openToPrograms = data.Open_To_All_Programs;

let subjectName = subName ? subName.trim() : undefined;
let departMentName = deptName ? deptName.trim() : undefined;
let campus = campusName ? campusName.trim() : undefined;
let batchNo = batches ? batches.trim() : undefined ;
let maxCapacityPerBatch = maxCapacity ? maxCapacity.trim() : undefined ;
let openToAllPrograms = openToPrograms ? openToPrograms.trim() : undefined;

if(subjectName!=undefined && departMentName!=undefined && campus!=undefined && batchNo!=undefined && maxCapacityPerBatch!=undefined && openToAllPrograms!=undefined){

let openPrograms = (openToAllPrograms === 'Yes') ? 'Y' : 'N';

if(role === 'Role_Admin'){

let insertCourseQuery = await courseQuery.insertCourse(subjectName,departMentName,batchNo,maxCapacityPerBatch,campus,openPrograms,username);
console.log('subject ids of excel',insertCourseQuery.rows);
let subjectArrayId = insertCourseQuery.rows;

 let courseArray = subjectArrayId.map(arr => ({
    subjectId: arr.sub_id,
    username: username
  }));

  if(openPrograms === 'Y'){

  let insertCoursePrograms = courseQuery.subjectProgram(courseArray);
    
  if(insertCoursePrograms != undefined){
    return res.json({status:'success',message:'Course Uploaded Successfully'});
  }else{
    return res.json ({message:'Error, Failed To Add Programs !!'})
  }
  }else{
    return res.json({status:'success',message:'Course Uploaded Successfully'});
  }

}else{
res.clearCookie('jwtauth');
return res.json({status:'error',redirectTo:'/elective/loginPage'});  
}

}else{
emptyArray.push({subjectName,departMentName,batchNo,maxCapacityPerBatch,campus,openPrograms,username});
}
});    

}else{
console.log('Array Not Found');    
return res.json({message:'File Should Not Be Empty !!'})    
}
}else{
return res.json({message:'File Not Found'});    
}    

}else{
res.clearCookie('jwtauth');    
return res.json({status:'error',redirectTo :'/elective/loginPage' }); 
}

}catch(error){
console.log(error);
return res.json({status:'error',redirectTo:'/elective/error'});
}    

},

getAllCourses:async (req,res) => {

 try{
 
 let username = req.session.modules;
 if(username != undefined){

 let courseData = await courseQuery.getCourses(username);

 if(courseData.rowCount > 0){
  return res.json({courseData : courseData.rows});
 } 

 }else{
 res.clearCookie('jwtauth');    
 return res.json({status:'error',redirectTo :'/elective/loginPage' }); 
 }   

 }catch(error){
  return res.json({status:'error',redirectTo:'/elective/error'});
 }   

},

insertCourseManually :async (req,res) => {
 
 try{
 
 let username = req.session.modules;
 let role = req.session.userRole;

 if(username != undefined){
 
 let {subjectName,department,batches,batchCapacity,campus,radioTypeValue} = req.body;
 let subjectValidation = (subjectName.length > 0) ? true : false;
 let departmentValidation = validation.departmentValidator(department);
 let batchValidation = validation.batchValidater(batches);
 let batchCapacityValidation = validation.batchCapacityValidater(batchCapacity);
 let campusValidation = validation.campusValidation(campus);
 
 if(subjectValidation && departmentValidation && batchValidation && batchCapacityValidation && campusValidation){
 
 if(role === 'Role_Admin'){
 let insertCourse = await courseQuery.insertCourse(subjectName,department,batches,batchCapacity,campus,radioTypeValue,username);
 let subjectArrayId = insertCourse.rows;

 let courseArray = subjectArrayId.map(arr => ({
    subjectId: arr.sub_id,
    username: username
 }));
 
 if(radioTypeValue === 'Yes'){

 let insertCoursePrograms = courseQuery.subjectProgram(courseArray);
 
 if(insertCoursePrograms != undefined){
 return res.json({status:'success',radioType:'Yes',message:'Course Uploaded Successfully !!'})
 }else{
 return res.json ({message:'Error, Failed To Add Programs !!'})
 }
 }else{
 return res.json({status:'success',redirectTo :'/elective/programList?id='+courseArray[0].subjectId,radioType:'No'}); 
 }

 }else{
 res.clearCookie('jwtauth');     
 return res.json({status:'error',redirectTo :'/elective/loginPage' });    
 } 


 }else{
 return res.json({message:'Invalid Inputs !!'});  
 }



 }else{
 res.clearCookie('jwtauth');    
 return res.json({status:'error',redirectTo :'/elective/loginPage' }); 
 }

 }catch(error){
  return res.json({status:'error',redirectTo:'/elective/error'});
 }   
    

},


allocatePrograms:async (req,res) => {
    try{
    
     let username = req.session.modules;
     let role = req.session.userRole;
    
     if(username != undefined){
     
     let {programArray} = req.body; 
     console.log('program array::: ' , programArray);

     if(role === 'Role_Admin'){
     const promises = programArray.map(async arr => {     
     courseQuery.allocateCoursePrograms(arr.subjectId,arr.programId,username);
     })

     Promise.all(promises)
     .then(() =>{
        return res.json({status:'success',message:'Programs Allocated Succesfully'});
     })
     .catch(error => {
        return res.json({status : 'error',redirectTo :'/elective/error'}); 
     })

     }else{
      res.clearCookie('jwtauth');
      return res.json({status:'error',redirectTo :'/elective/loginPage' }); 
     }

     }else{
      res.clearCookie('jwtauth');
      return res.json({status:'error',redirectTo :'/elective/loginPage' }); 
     } 
    
    }catch(error){
      return res.json({status : 'error',redirectTo :'/elective/error'})
    }
    
    
    }
}