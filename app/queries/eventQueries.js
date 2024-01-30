const { pgPool } = require('../config/database.js');

const query = class EventQuery{
    
  static async getChildModules(username,moduleName){
    let queries = {
        text: `select u.firstname,u.username,ro.role_name,mo.module_name,mo.url,mo.photo from user_info u inner join user_roles r on u.id=r.user_lid inner join roles ro on ro.role_id = r.role_lid
        inner join module_mapping m on m.role_id = ro.role_id inner join modules mo on mo.id = m.module_id
        where u.username = $1 and m.parent_moduleid is not null and u.active=true and r.active=true and ro.active=true and m.active=true and mo.active=true and m.parent_moduleid in (select id from modules where module_name= $2)`,
        values: [username,moduleName]
    }    
    return pgPool.query(queries);  
  }  


  static async getCampus(){
    return pgPool.query(`select campus_name from campus`);
  }

  static async getacadSession(){
    return pgPool.query(`select current_session from session_master`);
  }

  static async addEventdata(jsonData){
     let queries = {
       text : `select addevent($1)`,
       values : [jsonData]
     }

     return pgPool.query(queries);
  }

  static async getAllEventData(username){
    
    console.log('Query called for pagination :: ' );
    let queries = {
      text:`select e.id,e.event_name,s.current_session,e.acad_year,e.createdby,e.startdate,e.end_date,c.campus_name,e.is_published from event_master e 
      inner join session_master s on e.session_lid = s.sem_id inner join campus c on e.campus_lid = c.campus_id where e.createdby = $1 
      and e.active = true and c.active = true and s.active = true order by e.id desc ; `,
      values: [username]
    }
    return pgPool.query(queries);
  }

  static async registerStudentExcel (studentData){
    
    console.log('studentData BEFORE INSERT::::::::::' , JSON.parse(JSON.stringify(studentData.studentData)));
  
  let queries ={
    text: `select register_student($1)`,
    values: [JSON.stringify(studentData.studentData)]
  }

  return pgPool.query(queries);

  }

  static async getAllCampus(){
    let querie = await pgPool.query(`select campus_name from campus`);
    return querie.rows;
  }

  static async getAllSessions(){
    let querie = await pgPool.query(`select current_session from session_master`);
    return querie.rows;
  }


}

module.exports = query;