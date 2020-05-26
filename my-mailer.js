var nodemailer = require('nodemailer');
var mailerhbs = require('nodemailer-express-handlebars');

var auth = {
    type: 'oauth2',
    user: 'kingfash5@gmail.com',
    clientId: '1080432188004-ba2vga8suv7gqmb1d4cq4vc4s8223m4k.apps.googleusercontent.com',
    clientSecret: '5uCrPSQuk4m2HseWXKtoXPvX',
    refreshToken: '1//04ZpEwcxnEL1FCgYIARAAGAQSNwF-L9Irj-YwMqjTRfmd7sUgwo_gSjRskeWOrjd4BIV-yMBCvKg0IiQRheCOWHikG_hCObohqfw',
};

var mailer = nodemailer.createTransport({
    service: 'gmail',  // More at https://nodemailer.com/smtp/well-known/#supported-services
    // secure: false,//true
    // port: 25,//465
    auth: auth
  // tls: {
  //   rejectUnauthorized: false
  // }
});

const handlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: 'views/mails',
    layoutsDir: 'views/mails',
    defaultLayout: '',
  },
  viewPath: 'views/mails',
  extName: '.hbs',
};

mailer.use('compile', mailerhbs(handlebarOptions));



module.exports = {
    sum: function(a,b) {
        return a+b
    },
    send_mail: function(mail_params) {
        mailer.sendMail({
            from: 'kingfash5@gmail.com',
            to: mail_params.cmail,
            subject: mail_params.subject,
            template: mail_params.template, //Name email file template
            context: mail_params
        }, function (err, response) {
            if (err) {
                console.log('Error send email, please contact administrator to best support.', err);
            }else{
              console.log('Email send successed to you email');
            }
            
        });
    }
};