const { pgPool } = require('../config/database.js');

module.exports = class CourseQuery {

static insertCourse(subjectName,departMentName,batchNo,maxCapacityPerBatch,campus,openPrograms,username){
 let query = {
    text : `insert into subject_master(subject_name,dept_name,batches,max_capacity_per_batch,campus_lid,open_to_allprograms,
            createdby,created_date,modifiedby,modified_date,active) values ($1,$2,$3,$4,(select campus_id from campus where campus_name = $5),
            $6,$7,now(),$8,now(),true)
            returning sub_id;`,
    values :[subjectName,departMentName,batchNo,maxCapacityPerBatch,campus,openPrograms,username,username]
 }   
 return pgPool.query(query);
}

static getCourses(username){
 let query={
  text: `select s.sub_id,s.subject_name,c.campus_name,s.open_to_allprograms,s.dept_name,s.max_capacity_per_batch,s.batches from public.subject_master s inner join campus c on s.campus_lid=c.campus_id where s.createdby =$1
         and s.active=true and c.active=true order by s.created_date desc`,
  values:[username]  
 }   
 return pgPool.query(query);
}

static subjectProgram(courseData){
 let query = {
  text :`select subject_program($1)`,
  values: [JSON.stringify(courseData)]  
 }   
 return pgPool.query(query);
}

static allocateCoursePrograms(subjectId,programId,username){
 let query={
  text:`insert into subject_program_mapping(subject_lid,program_lid,createdby,created_date,modifiedby,modified_date,active)
        values($1,$2,$3,now(),$4,now(),true)`,
  values:[subjectId,programId,username,username]  
 }
 return pgPool.query(query);
}

static deleteCourse(courseId){
let query={
 text:`delete from subject_master where sub_id = $1`,
 values:[courseId]   
}
return pgPool.query(query);    
}

static deleteCourseMapping(courseId){
 let query ={
  text : `delete from subject_program_mapping where subject_lid = $1`,
  values:[courseId]  
 }  
 return pgPool.query(query); 
}

static getAllCourseProgram(subId){
 let query= {
  text: `select p.program_name from subject_program_mapping s inner join program_master p on s.program_lid = p.program_id 
          where s.subject_lid = $1 and s.active = true and p.active =true;`,
  values:[subId]  
 }
 return pgPool.query(query);   
}

static updateCourse(subName,deptName,batches,capacity,campus,username){
 let query = {
  text: `update subject_master set subject_name= $1,dept_name=$2,batches=$3,max_capacity_per_batch=$4,
  campus_lid=(select campus_id from campus where campus_name=$5),modifiedby=$6,modified_date=now()`,
  values:[subName,deptName,batches,capacity,campus,username]
 }  
 return pgPool.query(query); 
}





}