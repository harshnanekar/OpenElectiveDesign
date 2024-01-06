const query = require('../queries/user.js');
const eventQuery = require('../queries/eventQueries.js');
const user = require('./user.js');
let excel = require('xlsx');


module.exports = {

    event :async (req,res) =>{
      try{

      let username = req.session.modules;
      
      if(username != undefined){

        let getmodules = await query.getModules(username);
        let childmodules = await eventQuery.getChildModules(username);

        return res.render('eventPage',{module:getmodules,childModules:childmodules.rows});

      }else{
        res.clearCookie('jwtauth');
        req.flash('error','Oops, Session Timeout Login Again!! ');
        return res.redirect("/elective/loginPage");
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
          let eventData = req.flash('event') || null;
          
          return res.render('addEvent',{module:modules,campus:campus.rows,acadSession:acadSession.rows,event:eventData} );

        }else{
          res.clearCookie('jwtauth');
          req.flash('error','Oops, Session Timeout Login Again!! ');
          return res.redirect("/elective/loginPage");
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
     
      let query = await eventQuery.addEventdata(jsonData);
   
      console.log("query return--- " , query);
      if(query.rowCount > 0){
       
        res.redirect('/elective/viewEvent');
  
      }else{     
     
        req.flash('event','Failed To Add Event');
        res.redirect('/elective/addEvent');
    
      }

    }else{
        req.flash('event','Invalid End Date,Please Select Valid Date');
        res.redirect('/elective/addEvent');
    }

     } else{
        res.clearCookie('jwtauth');
        req.flash('error','Oops, Session Timeout Login Again!! ');
        return res.redirect("/elective/loginPage");
    }
  
    }catch(error){

    console.log(error.message);
    res.redirect('/elective/error');
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
          req.flash('error','Oops, Session Timeout Login Again!! ');
          return res.redirect("/elective/loginPage");
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
        let fileError = req.flash('fileError') || undefined;
        return res.render('registerStudent',{module:getmodules,fileError : fileError});

      }else{

          res.clearCookie('jwtauth');
          req.flash('error','Oops, Session Timeout Login Again!! ');
          return res.redirect("/elective/loginPage");

      }

      }catch(err){
        console.log(err.message);
        return res.rtedirect("/elective/error");
      }

    },

    uploadStudentData : async (req,res) => {
      
      let username = req.session.modules;

      if(username != undefined){
        
      let file = req.file;
      if(file != undefined){
      
        let excelFile = excel.read(file.buffer ,{type:'buffer'});
        let sheet = excelFile.Sheets[excelFile.SheetNames[0]];
        let getData = excel.utils.sheet_to_json(sheet);
        let arrLength = getData.length;
        let studentArray = [];

        if(arrLength > 0) {

      
        getData.map( data => {
        let studentUname = data.Username;
        let studentFirstName = data.FirstName;
        let studentLastName = data.LastName;
        let acadSession = data.Acad_Session;
        let acadYear = data.Acad_Year;
        let campus = data.Campus;
        let rollNo = data.RollNo;

        if(studentUname != undefined && studentFirstName != undefined && studentLastName != undefined && acadSession != undefined && acadYear != undefined && campus != undefined && rollNo != undefined ){
          studentArray.push({studentUname,studentFirstName,studentLastName,acadSession,acadYear,campus,rollNo});
          console.log('Array found--- ', studentArray);
        }else{

          console.log('Array not fopund');
          req.flash('fileError','File Input Fields Cannot Be Empty');
          return res.redirect("/elective/register");
        }
      });
 
      }else{
        console.log('Array not fopund');
        req.flash('fileError','File Input Fields Cannot Be Empty');
        return res.redirect("/elective/register");
      }

        console.log('excel file ' , excelFile);

       }else{
         req.flash('fileError','Input Field is Empty');
         return res.redirect("/elective/register");
      }

      }else{

        res.clearCookie('jwtauth');
        req.flash('error','Oops, Session Timeout Login Again!! ');
        return res.redirect("/elective/loginPage");

      }
    


    }

   



}