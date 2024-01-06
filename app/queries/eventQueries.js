const { postgres } = require('../config/database.js');

const query = class EventQuery{
    
  static async getChildModules(username){
    let queries = {
        text: `select u.firstname,u.username,ro.role_name,mo.module_name,mo.url,mo.photo from user_info u inner join user_roles r on u.id=r.id inner join roles ro on ro.role_id = r.role_lid
        inner join module_mapping m on m.role_id = ro.role_id inner join modules mo on mo.id = m.module_id
        where u.username = $1 and m.parent_moduleid is not null and u.active=true and r.active=true and ro.active=true and m.active=true and mo.active=true `,
        values: [username]
    }
      
    return postgres.query(queries);
  }  


  static async getCampus(){
    return postgres.query(`select campus_name from campus`);
  }

  static async getacadSession(){
    return postgres.query(`select current_session from session_master`);
  }

  static async addEventdata(jsonData){
     let queries = {
       text : `select addevent($1)`,
       values : [jsonData]
     }

     return postgres.query(queries);
  }

  static async getAllEventData(username){
    
    console.log('Query called for pagination :: ' );
    let queries = {
      text:`select e.id,e.event_name,s.current_session,e.acad_year,e.createdby,e.startdate,e.end_date,c.campus_name,e.is_published from event_master e 
      inner join session_master s on e.session_lid = s.sem_id inner join campus c on e.campus_lid = c.campus_id where e.createdby = $1 
      and e.active = true and c.active = true and s.active = true order by e.id desc ; `,
      values: [username]
    }
    return postgres.query(queries);
  }


}

module.exports = query;