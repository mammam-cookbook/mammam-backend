let register_message = (to) => {
    return {
      // Comma separated list of recipients
      to: `<${to}>`,
  
      // Subject of the message
      subject: "Wecome email ✔",
  
      // HTML body
      html: `<p><b>Hello ${to}!</b></p>
          <p>Here is your confirmation link: <a href="${process.env.HOST}:${process.env.FE_PORT}/active?code=">Click Here</a></p>`,
    };
  };
  let forget_message = (to, code) =>{
      return {
        // Comma separated list of recipients
        to: `<${to}>`,
  
        // Subject of the message
        subject: "Recover password ✔",
  
        // plaintext body
        text: `Hello ${to}! Here is your confirmation to reset your password : ${process.env.HOST}:${process.env.FE_PORT}/confirm?code=${code}`,
  
        // HTML body
        html: `<p><b>Hello ${to}!</b></p>
          <p>Here is your confirmation to reset your password  ${code}: <a href="${process.env.HOST}:${process.env.FE_PORT}/confirm?code=${code}">Click Here</a></p>`,
      };
  };
  let pay_message = {};
  module.exports = {
    register_message,
    forget_message,
  };