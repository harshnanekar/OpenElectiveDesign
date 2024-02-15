const {pgPool} = require('../config/database.js');

module.exports = class Basket{

static getBasketForEvent(eventId){

 let query = {   
 text:`select ba.id,ba.basket_name,ba.basket_abbr,c.campus_name from basket_event b inner join event_master e on 
 b.event_lid = e.id inner join basket ba on ba.id = b.basket_lid inner join campus c on b.campus_lid = c.campus_id
 where b.event_lid = $1 and b.active=true and e.active=true and ba.active=true and c.active=true`,
 values:[eventId]   
 }

 return pgPool.query(query);
}

static insertBasket(basketdata){
   let query = {
    text:`select createbasket($1)`,
    values:[JSON.stringify(basketdata)]
   } 
   return pgPool.query(query);
}

static deleteBasketEventData(basketId){
  let query = {
   text:`update basket_event set active=false where basket_lid=$1`,
   values:[basketId] 
  }  
  return pgPool.query(query);
} 

static deleteBasketData(basketId){
   let query ={
    text:`update basket set active=false where id = $1`,
    values:[basketId]
   } 
   return pgPool.query(query);
}

static getAllBaskets(username){
  let query = {
    text : `select id,basket_name from basket where createdby = $1 and active=true`,
    values:[username]
  }
  return pgPool.query(query);  
}

static displayAllBaskets(){
  let query ={
    text:`select b.basket_name,c.campus_name,s.current_session,be.basket_elective_no,be.no_of_comp_sub from basket_event be inner join basket b on be.basket_lid = b.id 
    inner join event_master e on be.event_lid=e.id inner join campus c on e.campus_lid = c.campus_id inner join session_master s on e.session_lid = s.sem_id where 
    be.active = true and b.active=true and e.active=true and c.active=true and s.active=true`,
  }  
  return pgPool.query(query);
}

} 