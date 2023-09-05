const nodemailer = require('nodemailer');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(session({
    secret: '38947gf4873r4r',
    resave: false,
    saveUninitialized: true,
  }));
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname,'public'))); 
function generateRandom6DigitNumber() {
    const min = 100000; 
    const max = 999999; 
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  
    return randomNumber;
  }
  

  
  app.post('/verify',(req,res)=>{
    const {firstName , lastName , email } = req.body;
    // console.log(firstName+" "+lastName+" "+email);
    if(!firstName || !lastName || !email)
    {
        res.redirect('/fail.html');
        return;
    }
    const random6DigitNumber = generateRandom6DigitNumber();
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'aniketkashyapak17@gmail.com',
      pass: 'ezkgttbglhfljpxw',
    },
  });
  const mail = `
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Display 6-Digit Number</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        /* Center the content vertically and horizontally */
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div class="container text-center">
        <h1 class="display-4">Your One-Time-Password</h1>
        <p class="lead" display-4>${random6DigitNumber}</p>
    </div>
</body>
</html>
  `;
   const mailOptions = {
    from: 'aniketkashyapak17@gmail.com',
    to: `${email}`,
    subject: 'VERIFCATION OF EMAIL',
    html:mail,
  };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error:', error);
          res.redirect('/fail.html')
        } else {
          req.session.secret=random6DigitNumber;
          req.session.email=email;
          req.session.fname=firstName;
          req.session.lname=lastName;
          console.log('Email sent:', info.response);
          res.redirect(`/verify`)
        }
      });
  })
  app.get('/verify',(req,res)=>{
    res.redirect("/verify.html");   
  })
  app.post('/signup',(req,res)=>{
    const {otp} = req.body;
    if(otp==req.session.secret)
    {
        const data = {
            members: [
              {
                email_address: req.session.email,
                status: 'subscribed',
                merge_fields: {
                  FNAME: req.session.fname,
                  LNAME: req.session.lname
                }
              }
            ]
          };
          const postData = JSON.stringify(data);
          const options = {
            url : 'https://us21.api.mailchimp.com/3.0/lists/6764602961',
            method:'POST',
            headers:{
              Authorization:'auth 2a8176ad10d422c7cb4ceecc35c16375-us21'
            },
            body:postData
          }
          request(options,(err,response,body)=>{
            if(err)
            {
              console.log(err);
              res.redirect('/fail.html')
            }
            else if(response.statusCode==200)
            {
              res.redirect('/sucess.html');
            }
            else
            {
              res.redirect('/fail.html')
            }
          })
    }
    else
    {
        res.redirect('/wrong.html');
    }
  })

  const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Running at Port ${PORT}`);
})

  
  
  