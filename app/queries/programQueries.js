const { pgPool } = require('../config/database.js');

module.exports = class ProgramQuery {

  static async insertPrograms(prgArray){

    console.log("program array:: ",prgArray);
   let query = {
    text: `select insert_programs($1)`,
    values: [JSON.stringify(prgArray.prgArray)]
   }

   return pgPool.query(query);
  }

}