const excel = require('xlsx');
const eventQuery = require('../queries/eventQueries.js');


module.exports =class Excel {

 static readExcelFile(file){

  let excelFile = excel.read(file.buffer,{type:'buffer'});
  let excelSheets = excelFile.Sheets[excelFile.SheetNames[0]];
  let excelJson = excel.utils.sheet_to_json(excelSheets);
 
   return excelJson;
 }

 static createExcel(data,excelFileName){
    
  let excelJson = excel.utils.json_to_sheet(data);
  let workbook = excel.utils.book_new();
  excel.utils.book_append_sheet(workbook,excelJson,'exceljson');
  excel.writeFile(workbook,excelFileName)
   
 }

}