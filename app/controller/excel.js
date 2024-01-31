const excel = require('xlsx');
const eventQuery = require('../queries/eventQueries.js');


module.exports = class ExcelDropdown {

 static async excelDropDownRegisterStudent(fileName){

  let excelFile = excel.readFile(fileName);
  let range = {s: { c: 3, r: 0 }, e: { c: 3, r: 0 } };
  let range1 = {s:{c:0,r:5},e:{c:10,r:5}};

  let sheetName = 'Sheet1';

  let session = [];
  let dataForSession = await eventQuery.getacadSession();
  session =  dataForSession.rows;
  
  console.log("session master data::: " , session);

  let workSheet = excelFile.Sheets[sheetName];

  let cellAddress = excel.utils.encode_range(range);
  cellAddress.split(':').forEach( cell => {
   workSheet[cell].dv = {
     t : 'list',
     l: session.map(option => ({ v: option.current_session })),
   };
  });
  
  excel.writeFile(excelFile,fileName); 
  console.log('Excel dropdown added');
 
}   

};