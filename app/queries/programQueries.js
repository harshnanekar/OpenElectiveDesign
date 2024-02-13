const { pgPool } = require("../config/database.js");

module.exports = class ProgramQuery {
  static async insertPrograms(prgArray) {
    console.log("program array:: ", prgArray);
    let query = {
      text: `select insert_programs($1)`,
      values: [JSON.stringify(prgArray.prgArray)],
    };

    return pgPool.query(query);
  }

  static async viewPrograms(username) {
    let query = {
      text: `select distinct p.program_name,c.campus_name,c.campus_abbr,p.program_id from program_campus_mapping pc 
    inner join campus c on pc.campus_lid=c.campus_id inner join program_master p on p.program_id = pc.program_lid
    where p.createdby=$1 and pc.active=true and p.active=true and c.active=true;`,
      values: [username],
    };
    return pgPool.query(query);
  }

  static async getAllProgramsList(username) {
    let query = {
      text: `select program_id,program_name from program_master where createdby =$1 and active=true`,
      values: [username],
    };
    return pgPool.query(query);
  }
};
