
module.exports = class Email{

  static async sendMail(toEmail,subject,message){
    let mailUrl = process.env.NOTIFICATION_URL;
    if(!mailUrl) return undefined;
    
    const body = { toEmail, subject, message, fromAddress: 'noreply-portal@svkm.ac.in'}
    const requestDetails = {
      method : 'POST',
      headers:{
      "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined  
    }

    console.log('fetch for mail')
    const response = await fetch(`${mailUrl}/send-email`,requestDetails)
    console.log('response::::: ',response);
    return response;
   
  }




}