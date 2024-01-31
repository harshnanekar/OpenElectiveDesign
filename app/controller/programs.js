const query = require('../queries/eventQueries.js')
const userQuery = require('../queries/user.js')
const excel = require('xlsx');

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

 let excelFile = excel.read(file.buffer,{type:'buffer'});
 let sheet = excelFile.Sheets[excelFile.SheetNames[0]];
 let excelData = excel.utils.sheet_to_json(sheet);
 let programArray = excelData.length;
 
 if(programArray > 0){
  console.log('File Array::::::: ' , excelData);
 }else{
  return res.json({message:'File Cannot Be Empty !!'});
 }

 }else{
 
  return res.json({message:'File Not Found !!'});  
 
 }

 }else{
  return res.json({status:'error',redirectTo :'/elective/loginPage' });  
 }


}catch(error){

 console.log(error.message);
 return res.json({status:'error',redirectTo:'/elective/error'});  

}    

}





}