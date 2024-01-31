const query = require('../queries/eventQueries');

module.exports = class Validation{

   static fnameValidation(res,fname){ 
    try{
    
    console.log('fname>>>>> ' , fname); 
    if(fname.length > 0){
    
    let validateCharacters = Validation.alphabetValidation(fname);
    return validateCharacters;
    
    }else{

    return false;
         
    }  
          
    }catch(error){
    console.log(error.message);
    return res.redirect("/elective/error");
    }
  }

   static lnameValidation(res,lname){
    console.log('lname>>>>> ' , lname); 
    try{

    if(lname.length > 0){
    
    let validateCharacters = Validation.alphabetValidation(lname);
    return validateCharacters;
    
    }else{

    return false;
         
    }  
          
    }catch(error){
    console.log(error.message);
    return res.redirect("/elective/error");
    
    }
   }

   static rollNoValidation(res,rollNo){
    try{
    
    if(rollNo.length > 0){

      let validateCharacters = Validation.characterValidation(rollNo);
      return validateCharacters; 
    
    }else{
      return false;
    }  

    }catch(error){
      console.log(error.message);
      return res.redirect("/elective/error");
    }
   }

   static alphabetValidation (input_text){

    console.log('text length>>> ' , input_text);
    let text_length = input_text.length;

    for(let i = 0; i < text_length; i++){

    let asciiValue = input_text.charCodeAt(i);

    if(asciiValue >= 33 && asciiValue <= 64 || asciiValue >= 91 && asciiValue <= 96 || asciiValue >= 123 && asciiValue <= 126){
        return false;
    }

    }
    return true;
  }
  
  static characterValidation(inputText){
    
    let text_length = inputText.length;

    for(let i=0; i < text_length ; i++){

    let asciiValue = inputText.charCodeAt(i);

    if(asciiValue >= 33 && asciiValue <= 47 || asciiValue >= 58 && asciiValue <= 64 || asciiValue >= 91 && asciiValue <= 96 || asciiValue >= 123 && asciiValue <= 126){
        return false;     
    }

    }

    return true;
  }

  static campusValidation(input_text){

    try{
   
    let campusData = query.getAllCampus();
    
    for(let i=0; i < campusData.length; i++){
        if(input_text != campusData[i].campus_name){
          return false;
        }
    }

    return true;
    }catch(error){
      console.log(error.message);
      return res.redirect("/elective/error");
    }
  }

  static async newAcadYearValidation(res,acadYear){
    console.log('new acad year ' , acadYear);
    try{  
  
      let date = new Date();
      let year = date.getFullYear();
    
      let prevYear = `${(year-1)}-${year}`;
      let currYear = `${year}-${(year + 1)}`;
      let nextYear = `${(year + 1)}-${(year + 2)}`;
       
      let yearArray = [prevYear,currYear,nextYear];
      console.log('Year>> ', yearArray);
    
      for(let i = 0; i < yearArray.length; i++){
        console.log('Year data>> ', yearArray[i]);
        if(acadYear == yearArray[i]){
        return true;
      }
    
      }
       return false;
    
      }catch(error){
        console.log(error.message);
        return res.redirect("/elective/error");
      }
  }

  static acadSessionValidation(res,input_text){

    try{
   
    let sessionData = query.getAllSessions();

    for(let i = 0; i < sessionData.length; i++){
     
     if(input_text != sessionData[i]){
      return false;
     }
      
    }
    return true;
    }catch(error){
      console.log(error.message);
      return res.redirect("/elective/error");
    }
  }

  static UsernameValidation(res,userData){

    try{

     if(userData.length > 0){
      return true;
     }else{
      return false;
     }
      
    }catch(error){
      console.log(error.message);
      return res.redirect("/elective/error");
    }
  }


};