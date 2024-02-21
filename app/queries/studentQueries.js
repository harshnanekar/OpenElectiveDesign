const {pgPool} = require('../config/database.js');

module.exports = class Student {

static getStudentEvent(username){
 let query = {
   text:`select e.id,e.event_name,e.startdate,e.end_date from event_master e inner join session_master s on e.session_lid=s.sem_id
   where s.current_session in (select s.next_session from session_master s inner join student_info si on s.sem_id = si.acad_session 
   inner join user_info u on u.id=si.user_lid where u.username =$1 and s.active=true and si.active=true and u.active=true) and e.active=true
   and e.is_published='Y'`,
   values:[username] 
 }   
 return pgPool.query(query);
}

static displayBasket(eventId,username){
  let query = {
   text:`
   select s.sub_id,bsk.basket_name,s.subject_name,be.basket_elective_no,be.event_lid,be.no_of_comp_sub,e.event_name from basket_subject bs inner join basket_event be on bs.basket_lid=be.basket_lid 
   inner join subject_master s on bs.subject_lid = s.sub_id inner join basket bsk on bsk.id=be.basket_lid inner join event_master e on e.id=be.event_lid where be.basket_lid in 
   (SELECT basket_lid 
   FROM basket_event 
   WHERE basket_lid NOT IN (
    SELECT DISTINCT bs.basket_lid 
    FROM student_sub_allocation s 
    INNER JOIN basket_subject bs ON s.subject_lid = bs.subject_lid 
    INNER JOIN user_info u ON s.user_lid = u.id 
    WHERE s.event_lid = $1 
    AND s.active = true 
    AND bs.active = true 
    AND u.username = $2
   ) 
	AND event_lid = $3
	AND active = true 
	ORDER BY basket_elective_no ASC 
	LIMIT 1) and bs.active=true and be.active=true and bsk.active = true order by be.basket_elective_no asc`,
   values:[eventId,username,eventId] 
  }
  return pgPool.query(query);
}

static showYearBackSubjects(username,eventId){
let query = {
 text:`select distinct su.subject_lid,be.event_lid,s.subject_name from student_sub_allocation su inner join subject_master s on su.subject_lid = s.sub_id  
 inner join basket_event be on be.event_lid = su.event_lid inner join user_info u on u.id=su.user_lid where u.username = $1 and su.event_lid not in ($2)
 and su.active=true and be.active=true and s.active=true and u.active=true`,
 values:[username,eventId] 
}
return pgPool.query(query);
}


}