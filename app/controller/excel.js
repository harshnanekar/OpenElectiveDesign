const excel = require('xlsx');
const eventQuery = require('../queries/eventQueries.js');


module.exports = {

 excelDropDownRegisterStudent : async () => {

  let fileName = 'D:/projects/openelective/open_elective/public/excel/StudentDetail_Demo1.xlsx';

  let excelFile = excel.readFile(fileName);
  let worksheet = excelFile.Sheets[excelFile.SheetNames[1]];
  //let worksheet1 = excelFile.Sheets[excelFile.SheetNames[2]];

  let session = [];
  let dataForSession = await eventQuery.getacadSession();
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

}