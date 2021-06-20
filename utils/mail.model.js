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
        <p>Here is your confirmation to reset your password  ${code}: <a href="mammam.me/confirm?code=${code}">Click Here</a></p>`,
    };
};
let ban_message = (to) =>{
  return {
    // Comma separated list of recipients
    to: `<${to}>`,

    // Subject of the message
    subject: "Notice from Mammam's admin team!",

    // HTML body
    html: `<p><b>Hello ${to}!</b></p>
      <p>We are sorry to inform that your account has been banned. You will not be able to log in until further notice. If you wish to file a complaint, please reply
      directly to this email.

      Sincerely,
      Mammam's admin team
      </p>`,
  };
};

let unban_message = (to) =>{
  return {
    // Comma separated list of recipients
    to: `<${to}>`,

    // Subject of the message
    subject: "Notice from Mammam's admin team!",

    // HTML body
    html: `<p><b>Hello ${to}!</b></p>
      <p>We are glad to inform that your account has been unbanned. You can now log in to your account. 

      Sincerely,
      Mammam's admin team
      </p>`,
  };
};

let delete_message = (to) =>{
  return {
    // Comma separated list of recipients
    to: `<${to}>`,

    // Subject of the message
    subject: "Notice from Mammam's admin team!",

    // HTML body
    html: `<p><b>Hello ${to}!</b></p>
      <p>We are sorry to imform you that your account has been permanently deleted.

      Sincerely,
      Mammam's admin team
      </p>`,
  };
};

let pay_message = {};

module.exports = {
  register_message,
  forget_message,
  ban_message,
  unban_message,
  delete_message
};