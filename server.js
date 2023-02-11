const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
require("dotenv").config();
const dbconfig = require("./config/dbconfig");
app.use(express.json());
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const departmentRoute = require("./routes/departmentsRoute");

app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/department", departmentRoute);
const port = process.env.PORT || 5000;

// console.log(process.env.MONGO_URL)
app.listen(port, () => console.log(`Listining on port ${port}`));

// Create a transport object using Gmail
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'saiyedsanan9@gmail.com',
//       pass: 'sanan10messi'
//     }
//   });


  // Define email options
// const mailOptions = {
//     from: 'saiyedsanan9@gmail.com',
//     to: 'dhruvirana516@gmail.com',
//     subject: 'Test Email from MERN Stack',
//     text: 'This is a test email sent from a MERN stack application'
//   };
  
  // Send the email
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
  
  
   
  
