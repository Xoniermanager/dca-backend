const nodeMailer = require('nodemailer');

exports.sendEmail = async (options) =>{
   const transportor = nodeMailer.createTransport({
       host : process.env.SMTP_HOST,
       port : process.env.SMTP_PORT,
       secure: true, 
       auth : {
           user : process.env.SMTP_EMAIL,
           pass : process.env.SMTP_PASSWORD,
       },
       service : process.env.SMTP_SERVICE,
   });

   const mailOptions = {
       from : process.env.SMTP_EMAIL,
       to : options.email,
       subject : options.subject,
       html : options.message,
   };
   await transportor.sendMail(mailOptions);
}