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
   select bsk.basket_name,s.subject_name,be.basket_elective_no,be.event_lid,be.no_of_comp_sub from basket_subject bs inner join basket_event be on bs.basket_lid=be.basket_lid inner join subject_master s
   on bs.subject_lid = s.sub_id inner join basket bsk on bsk.id=be.basket_lid where be.basket_lid in 
   (select basket_lid from basket_event where basket_lid not in (select distinct bs.basket_lid from student_sub_allocation s 
   inner join basket_subject bs on s.subject_lid = bs.subject_lid inner join user_info u on s.user_lid=u.id where s.event_lid = $1 and s.active=true and bs.active=true and u.username=$2) 
   and event_lid = $3 and active=true order by basket_elective_no limit 1) and bs.active=true and be.active=true and bsk.active = true order by be.basket_elective_no asc`,
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