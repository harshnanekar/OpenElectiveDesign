const  { pgPool } = require('../config/database.js');

const a = class data{
 
    static async authenticateLogin(username){
        console.log('Query executed ' + username);
        
        let datas = await pgPool.query('SELECT username,password FROM user_info WHERE username = $1 and active=true', [username]);
        if(datas.rowCount > 0){
            return datas.rows;
        }
        
    }

    static async getModules(username){
        let datas = await pgPool.query(`select u.id,u.firstname,u.lastname,u.email,u.username,ro.role_name,mo.module_name,mo.url,mo.photo from user_info u inner join user_roles r on u.id = r.user_lid inner join roles ro on r.role_lid = ro.role_id inner join module_mapping m
        on m.role_id = ro.role_id inner join modules mo on m.module_id = mo.id where u.username = $1 and mo.parent_moduleid is null 
        and u.active = true and mo.active=true and m.active = true and ro.active=true and r.active = true
        `,[username]);

        if(datas.rowCount > 0){
            return datas.rows;
        }
    }

    static async getUserRole(username){
        let query = await pgPool.query(`select ro.role_name from user_info u inner join user_roles r on u.id = r.user_lid inner join roles ro on ro.role_id = r.role_lid where username = $1 and u.active=true and r.active=true and ro.active=true `,[username]);
        
        if(query.rowCount > 0){
            return query.rows;
        }
    }

    static async checkUser(username){
      let query ={
        text:`select username,email from user_info where username=$1 and active=true`,
        values:[username]
      }
      return pgPool.query(query);  
    }

    static insertOtp(username,otp){
    let query ={
      text:`insert into user_otp(username,otp,otp_time,created_date,createdby,modified_date,modifiedby,active)
      values($1,$2,now(),now(),$3,now(),$4,true)`,
      values:[username,otp,username,username]
    }
    return pgPool.query(query);    
    }

    static checkOtpTime(username,otp){
     let query = {
      text:`SELECT *,
      CASE 
          WHEN EXTRACT(EPOCH FROM (NOW() - otp_time)) / 60 <= 5 THEN 'Valid'
          ELSE 'Otp Expired' 
      END AS otp_status 
        FROM user_otp 
        WHERE username=$1
            AND otp=$2
            AND DATE(created_date)=DATE(NOW()) 
        ORDER BY otp_time DESC 
        LIMIT 1`,
      values:[username,otp]  
     }
     return pgPool.query(query);   
    }

    static updatePassword(username,password) {
     let query = {
      text:`update user_info set password=$1 where username=$2`, 
      values:[password,username] 
     }
     return pgPool.query(query);   
    }

    //testing
    static getStudentForTest(acadLid){
        console.log('query called');
        let query = {
            text:`select * from student_info where acad_session = $1`,
            values:[acadLid]
        }
        return pgPool.query(query);
    }

    //testing
    static insertStudentForAllocationTesting(userlid,basketlid,subjectlid,eventlid,electiveNo,subjectPref){
     let query={
      text:`insert into student_sub_allocation(user_lid,basket_lid,subject_lid,event_lid,elective_no,sub_pref,created_date,modified_date,createdby,modifiedby,active)
      values($1,$2,$3,$4,$5,$6,now(),now(),'admin','admin',true)`,
      values:[userlid,basketlid,subjectlid,eventlid,electiveNo,subjectPref]  
     }   
     return pgPool.query(query);
    }

}

module.exports = a;