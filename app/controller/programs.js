const query = require('../queries/eventQueries.js')
const userQuery = require('../queries/user.js')
const programQuery = require('../queries/programQueries.js')
let excelController =  require('../controller/excel.js');
let validationController = require('../controller/validation.js');

module.exports =  {

programs : async (req,res) => {

  try{
  let username = await req.session.modules ; 

  if(username != undefined){

    let getmodules = await userQuery.getModules(username);
    let modules = await query.getChildModules(username,'Programs');
    return res.render("program",{module:getmodules,childModules:modules.rows});

  }else{
    res.clearCookie('jwtauth');
    return res.redirect("/elective/loginPage#sessionTimeout");
  }

  }catch(error){
    console.log(error.message);
    return res.redirect('/elective/error')
  }

},

addPrograms : async (req,res) => {

  try{

  let username =  req.session.modules;

  if(username != undefined){

   let getmodules = await userQuery.getModules(username);
   let campus = await query.getCampus();
  
   return res.render('addProgram',{module:getmodules,campus:campus.rows});
   
  }else{
    res.clearCookie('jwtauth');
    return res.redirect("/elective/loginPage#sessionTimeout");
  }
    
  }catch(error){
    console.log(error.message);
    return res.redirect('/elective/error')
  }
},

insertProgramsViaExcel : async (req,res) => {

try{

 console.log('Function called for excel');   
 let username = req.session.modules;
 
 if(username != undefined){

 let file = req.file;  

 console.log("File " + JSON.stringify(file));
 
 if(file != undefined){

  let excelData = excelController.readExcelFile(file);
  let programArray = excelData.length;

 console.log('programs::::: ', excelData[0].ProgramId);
 
 if(programArray > 0){

  let programArray = [];
  let nonInsertedPrograms = [];

  excelData.forEach(async prg => {
   
  let programName = prg.Program;
  let campusName = prg.Campus;
  let program_id = new String(prg.ProgramId);
  
  let program = programName ? programName.trim() : undefined;
  let campus = campusName ? campusName.trim() : undefined;
  let programId = program_id ? program_id.trim() : undefined;

  let role = req.session.userRole;
 
  if(program != undefined && campus != undefined && programId != undefined){
    programArray.push({program,campus,programId,username});
  }else{
    nonInsertedPrograms.push({program,campus,programId});
  }

  console.log('non inserted programs:::::::: ' , nonInsertedPrograms);

  if(programArray.length > 0) {
  if(role != undefined && role === 'Role_Admin'){

  let insertProgram = await programQuery.insertPrograms({'prgArray':programArray});
  
  if(insertProgram.rowCount > 0){
    console.log('Non Inserted Array--->> ',nonInsertedPrograms);
    return res.json({status:'success',message:'Programs Uploaded Succesfully !!',nonInsertedPrograms: nonInsertedPrograms});
  }else{
    return res.json({message:'Failed To Upload Data !!'});
  }

  }else{
    res.clearCookie('jwtauth');
    res.json({status:'error',redirectTo :'/elective/loginPage'});
  }
  }
  });

 }else{
  return res.json({message:'File Cannot Be Empty !!'});
 }

 }else{
  return res.json({message:'File Not Found !!'});  
 }

 }else{
  res.clearCookie('jwtauth');
  return res.json({status:'error',redirectTo :'/elective/loginPage' });  
 }


}catch(error){

 console.log(error.message);
 return res.json({status:'error',redirectTo:'/elective/error'});  

}    

},

insertProgramManaully :async (req,res) => {

  try{

  console.log('function called');  
  
  let username = req.session.modules;
  let userRole = req.session.userRole;
  
  if(username != undefined){
  
  let {program,campus,programId} = req.body;

  console.log("request body:: " , program , campus ,programId);

  let campusValidation =  validationController.campusValidation(res,campus);
  let programIdValidation = validationController.programIdValidation(res,programId);

  console.log("program validation:: " , programIdValidation);

  if(campusValidation && programIdValidation) {

  if(userRole === 'Role_Admin'){

  let prgArray = [{program,campus,programId,username}];  
  let insertProgramQuery = await programQuery.insertPrograms({prgArray});
 
  if(insertProgramQuery.rowCount > 0){
    console.log('Program uploaded successfully');
    return res.json({status:'success',message : 'Program Uploaded Successfully !!'});
  }else{
    return res.json({message : 'Failed To Upload Program !!'});
  }  

  }else{
    res.clearCookie('jwtauth');
    return res.json({status:'error',redirectTo : '/elective/loginPage'});
  }  
  
  }else{
    return res.json({message : 'Invalid Inputs !!'});
  }

  }else{
    res.clearCookie('jwtauth');
   return res.json({status:'error',redirectTo : '/elective/loginPage'});
  }  

  }catch(error){
   return res.json({status : 'error',redirectTo :'/elective/error'})
  }

},

viewPrograms :async (req,res) => {

  try{
  
  let username = req.session.modules;
  
  if(username != undefined){

  let getmodules = await userQuery.getModules(username);  
  let programData =await programQuery.viewPrograms(username);
  
  return res.render('viewPrograms',{module:getmodules,programData : programData.rows});

  }else{
    res.clearCookie('jwtauth');
    return res.redirect("/elective/loginPage#sessionTimeout");
  }  


  }catch(error){
  console.log(error);
  return res.redirect('/elective/error');
  }

},

getAllProgramsList : async (req,res) => {

try{

let username = req.session.modules;

if(username != undefined){

let getmodules = await userQuery.getModules(username);    
let programList = await programQuery.getAllProgramsList(username);
return res.render('programList',{programs:programList.rows,module:getmodules});

}else{
res.clearCookie('jwtauth');
return res.redirect("/elective/loginPage#sessionTimeout");
}

}catch(error){
return res.redirect('/elective/error');
}  
}


}