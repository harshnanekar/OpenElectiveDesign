const query = require('../queries/user.js');
const eventQuery = require('../queries/eventQueries.js');
const validation = require('../controller/validation.js');
const user = require('./user.js');
const excelController = require('../controller/excel.js');
let excel = require('xlsx');

let controller = {

    event :async (req,res) =>{
      try{

      let username = req.session.modules;
      
      if(username != undefined){

        let getmodules = await query.getModules(username);
        let childmodules = await eventQuery.getChildModules(username,'Event');

        return res.render('eventPage',{module:getmodules,childModules:childmodules.rows});

      }else{
        res.clearCookie('jwtauth');
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    }catch(err){

      console.log('Error ' + err.message);
      return res.redirect("/elective/error");

    }
     
    },

    addEvent : async (req,res) => {
      try{
        
      let username = req.session.modules;
      if(username != undefined){

          
      let modules = await query.getModules(username);
      let campus = await eventQuery.getCampus();
      let acadSession = await eventQuery.getacadSession() ;
          
        return res.render('addEvent',{module:modules,campus:campus.rows,acadSession:acadSession.rows} );

        }else{
          res.clearCookie('jwtauth');
          return res.redirect("/elective/loginPage#sessionTimeout");
        }
             
      }catch(err){
        console.log(err.message);
        return res.redirect('/elective/error')
      }
    },

    eventData :async function(req,res){

      let username = req.session.modules;
     
      try{
      
     if(username != null){
      let {eventName , semester , acad_year , campus,start_date,end_date} = req.body;

      let startDate = start_date.split('T')[0];
      let endDate = end_date.split('T')[0];

      let dateValidate = new Date(startDate) < new Date(endDate);
      if(dateValidate){
        
      let jsonData =  JSON.stringify({eventName , semester , acad_year , campus, start_date , end_date , username});
      let user_role = req.session.userRole;
     
      if(user_role !=undefined && user_role === 'Role_Admin'){
      let query = await eventQuery.addEventdata(jsonData);
   
      console.log("query return--- " , query);

      if(query.rowCount > 0){ 
        return res.json({status:'success',redirectTo:'/elective/viewEvent'});
      }else{     
        return res.json({status:'error',message:'Failed To Create Event !!'});   
      }

      }else{
       return res.json({status:'error',redirectTo:'/elective/loginPage'})
      }

      }else{
        return res.json({status:'error',message:'Invalid Date Input !!'}); 
      }

      } else{
        res.clearCookie('jwtauth');
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
  
      }catch(error){
      console.log(error.message);
      return res.json({status:'error',redirectTo:"/elective/error"});
      }
      
    },

    viewEvent:async function(req,res){
      try{

        let username = req.session.modules;
        
        if(username != undefined){
  
          let getmodules = await query.getModules(username);
          let eventData = await eventQuery.getAllEventData(username);

          return res.render('viewEvent',{module:getmodules,eventData:eventData.rows});
  
        }else{
          res.clearCookie('jwtauth');
          return res.redirect("/elective/loginPage#sessionTimeout");
        }
      }catch(err){
  
        console.log('Error ' + err.message);
        return res.redirect("/elective/error");
      }
     },

    registerStudent : async (req,res) => {
       
      try{

      let username = req.session.modules;
      if(username != undefined){
  
        let getmodules = await query.getModules(username);
        let campus = await eventQuery.getCampus();
        let acadSession = await eventQuery.getacadSession() ;
        excelController.excelDropDownRegisterStudent;

        return res.render('registerStudent',{module:getmodules,campus:campus.rows,acadSession:acadSession.rows});

      }else{

        res.clearCookie('jwtauth');
        return res.redirect("/elective/loginPage#sessionTimeout");

      }

      }catch(err){
        console.log(err.message);
        return res.redirect("/elective/error");
      }

     },

    uploadStudentData : async (req,res) => {
      
      try{ 

      console.log('File function called');  
      let username = req.session.modules;

      if(username != undefined){
        
      let file = req.file;

      console.log('File found ' , file); 
      if(file != undefined){
      
        let excelFile = excel.read(file.buffer ,{type:'buffer'});
        let sheet = excelFile.Sheets[excelFile.SheetNames[0]];
        let getData = excel.utils.sheet_to_json(sheet);
        let arrLength = getData.length;
        let studentArray = [];
        let emptyStudentArray = [];

        if(arrLength > 0) {

      
        getData.forEach( async data => {
        let studentUname = data.Username;
        let studentFirstName = data.FirstName;
        let studentLastName = data.LastName;
        let acadSession = data.Acad_Session;
        let acadYear = data.Acad_Year;
        let campus = data.Campus;
        let rollNo = data.RollNo;

        if(studentUname != undefined && studentFirstName != undefined && studentLastName != undefined && acadSession != undefined && acadYear != undefined && campus != undefined && rollNo != undefined ){
          studentArray.push({studentUname,studentFirstName,studentLastName,acadSession,acadYear,campus,rollNo,username});
          console.log('Array found--- ', studentArray);
        }else{          
          console.log('Array not found');
          emptyStudentArray.push({studentUname,studentFirstName,studentLastName,acadSession,acadYear,campus,rollNo,username});
        }
        });

        let user_role =req.session.userRole;
        if(studentArray.length > 0){

         if(user_role !=undefined && user_role === 'Role_Admin'){

         let registerStudentCall = await eventQuery.registerStudentExcel({'studentData':studentArray});
          console.log("registerStudentCall:::::::::::", registerStudentCall);
        
         if(registerStudentCall.rowCount > 0){

          return res.json({message:'File Uploaded Successfully !!',status:'success',nonInserted : emptyStudentArray});

         }else{
          return res.json({message:'Failed To Upload File !!'});
         }

         }else{
          return res.json({status:'error',redirectTo :'/elective/loginPage' });
         }
         }
       }else{
        console.log('Array not found');
        return res.json({message:'File Cannot Be Empty !!'});
       }

       }else{    
        return res.json({status:'File Not Found !!'});;
       }

      }else{

        res.clearCookie('jwtauth');
        return res.redirect("/elective/loginPage#sessionTimeout");

      }
      }catch(err){
      console.log(err.message);
      return res.json({status:'error',redirectTo:"/elective/error"});
      }

      },

       registerStudentManually : async (req,res) => {

       try{

       let username = req.session.modules;
      
       if(username != undefined){
       
       let {fname,lname,rollNo,campus,studUsername,acadYear,acadSession} = req.body;

       const validationPromises = [
        validation.fnameValidation(res, fname),
        validation.lnameValidation(res, lname),
        validation.rollNoValidation(res, rollNo),
        validation.campusValidation(res, campus),
        validation.newAcadYearValidation(res,acadYear),
        validation.acadSessionValidation(res,acadSession),
        validation.UsernameValidation(res,studUsername)
      ];
  
      const [fnameVal, lnameVal, rollNoVal, campusVal,acadYearVal,sessionVal,usernameVal] = await Promise.all(validationPromises);
      console.log('Validate----roll ' , rollNoVal,campusVal, acadYearVal, sessionVal);
      let manualArray = [];

      if(fnameVal && lnameVal && rollNoVal && campusVal && acadYearVal && sessionVal && usernameVal){
       
       studentFirstName = fname;
       studentLastName = lname;
       studentUname = studUsername;

      console.log('Validated rightly', fnameVal,lnameVal,rollNoVal,campusVal,acadYearVal,sessionVal,usernameVal);
      manualArray.push({studentFirstName,studentLastName,rollNo,campus,studentUname,acadYear,acadSession,username});

      let user_role = req.session.userRole;
      
      if(user_role !=undefined && user_role === 'Role_Admin'){

      let registerManually= await eventQuery.registerStudentExcel({'studentData':manualArray});
         
      if(registerManually.rowCount > 0){
        return res.json({status:'success',message:'Student Registered Successfully !!'});
      }else{
        return res.json({status:'error',message:'Failed To Registered Student !!'});
      }

      }else{
        return res.json({status:'error',redirectTo : '/elective/loginPage'});
      }

      }else{
        return res.json({status:'error',message:'Invalid Credentials !!'});
      }

      }else{

      res.clearCookie('jwtauth');
      return res.redirect("/elective/loginPage#sessionTimeout");  

      }
     
      }catch(error){
      console.log(error.message);
      return res.json({status:'error',redirectTo:"/elective/error"});;
      }

      },

      }

      module.exports = controller ;
