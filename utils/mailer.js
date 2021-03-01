var nodemailer = require("nodemailer");
console.log('----------- auth ------------', {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  });
let transporter = nodemailer.createTransport(
  {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_POST,
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    logger: true,
    debug: false, // include SMTP traffic in the logs
  },
  {

    // sender info
    from: "MAMMAM <mammam.com>"
  }
);

module.exports = (message) => {
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log("[MAIL][ERROR] "+ error.message);
    }else{
      console.log("[MAIL][SUCCESS] Message sent successfully!: ", info);
    }
  });
};