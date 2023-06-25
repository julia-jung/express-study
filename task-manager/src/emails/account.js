const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const from = 'minji6654@gmail.com';

const sendWelcomeEmail = (to, name) => {
  console.log('sending email');
  sgMail.send({
    to,
    from,
    subject: 'Thank you for joining in!',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
    // html: ''
  });
};

const sendCancelationEmail = (to, name) => {
  sgMail.send({
    to,
    from,
    subject: 'GoodBye, your account has been canceled',
    text: `Goodbye, ${name}. I hope to see you back sometime soon.`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
};