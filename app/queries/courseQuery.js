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
  text: `select s.sub_id,s.subject_name,c.campus_name,s.open_to_allprograms from public.subject_master s inner join campus c on s.campus_lid=c.campus_id where s.createdby =$1
         order by s.created_date desc`,
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






}