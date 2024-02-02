
module.exports = {

addCourses:async (req,res) => {

try{
 
 let username = req.session.modules;
 
 if(username != undefined){
   
 let getmodules = await userQuery.getModules(username);
     

 }else{
 res.clearCookie('jwtauth');
 return res.redirect("/elective/loginPage#sessionTimeout");
 }

}catch(error){
 res.clearCookie('jwtauth');
 return res.redirect("/elective/loginPage#sessionTimeout");  
}

}



}