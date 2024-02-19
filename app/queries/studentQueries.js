const {pgPool} = require('../config/database.js');

module.exports = class Student {

static getStudentEvent(username){
 let query = {
   text:`select e.event_name,e.startdate,e.end_date  from user_info u inner join student_info s on u.id = s.user_lid inner join event_master e on s.acad_session = e.session_lid 
   where u.username = $1 and u.active=true and e.active=true and s.active=true`,
   values:[username] 
 }   
 return pgPool.query(query);
}







}