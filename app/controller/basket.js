const basket = require('../queries/basketQueries.js');
const query = require('../queries/user.js');


module.exports = {

addBasketPage: async (req,res) => {

try{

let username = req.session.modules;
if(username != undefined){

let eventId = req.params.id;
console.log('eventId ' , eventId);

let basketData = await basket.getBasketForEvent(eventId);
let getmodules = await query.getModules(username);

if(basketData.rowCount > 0){

return res.render("addBasket",{module:getmodules,basketData : basketData.rows});   

}else{
return res.render("addBasket",{module:getmodules,basketData : []});     
}

}else{
res.clearCookie('jwtauth');
return res.redirect('/elective/loginPage' );
}   

}catch(error){
return res.redirect('/elective/error' );
}

}








}