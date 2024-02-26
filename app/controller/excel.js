const excel = require('xlsx');
const eventQuery = require('../queries/eventQueries.js');


module.exports =class Excel {

 static excelDropDownRegisterStudent() {

  let fileName = 'D:/projects/openelective/open_elective/public/excel/StudentDetail_Demo1.xlsx';

  let excelFile = excel.readFile(fileName);
  let worksheet = excelFile.Sheets[excelFile.SheetNames[1]];
  //let worksheet1 = excelFile.Sheets[excelFile.SheetNames[2]];

  let session = [];
  let dataForSession = eventQuery.getacadSession();
  session =  dataForSession.rows;

  console.log('Acad Session:::::: ', session);

    let row = 2; 
    session.forEach((acadSession) => {
    
      worksheet[`A${row}`] = { v: acadSession.current_session };
      row += 1;
    });

    // let date = new Date();
    // let year = date.getFullYear();

    // console.log('Year:::: ' + year);

    // let previousYear = `${year-1}-${year}`;
    // let currYear = `${year}-${year + 1}`;
    // let nextYear = `${year + 1}-${year + 2}`;

    // let totalYear = [previousYear,currYear,nextYear];

    // totalYear.forEach( acadYear => {
    //   console.log('Year:::: ' + acadYear);
    //   worksheet1[A`${row}`] = {v : acadYear};
    //   row += 1;
    // })

 
    excel.writeFile(excelFile,fileName);

 }

 static readExcelFile(file){

  let excelFile = excel.read(file.buffer,{type:'buffer'});
  let excelSheets = excelFile.Sheets[excelFile.SheetNames[0]];
  let excelJson = excel.utils.sheet_to_json(excelSheets);
 
  console.log("column header " , excelJson[0]);

   return excelJson;
 }

}