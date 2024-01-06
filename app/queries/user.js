const  { postgres } = require('../config/database.js');

const a = class data{
 
    static async authenticateLogin(username){
        console.log('Query executed ' + username);
        
        let datas = await postgres.query('SELECT username,password FROM user_info WHERE username = $1', [username]);
        if(datas.rowCount > 0){
            return datas.rows;
        }
        
    }

    static async getModules(username){
        let datas = await postgres.query(`select u.firstname,u.lastname,u.email,u.username,ro.role_name,mo.module_name,mo.url,mo.photo from user_info u inner join user_roles r on u.id = r.user_lid inner join roles ro on r.role_lid = ro.role_id inner join module_mapping m
        on m.role_id = ro.role_id inner join modules mo on m.module_id = mo.id where u.username = $1 and mo.parent_moduleid is null 
        and u.active = true and mo.active=true and m.active = true and ro.active=true and r.active = true
        `,[username])

        if(datas.rowCount > 0){
            return datas.rows;
        }
    }

    
    
}

module.exports = a;