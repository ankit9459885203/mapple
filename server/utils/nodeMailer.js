const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  // sender

  const transporter = nodemailer.createTransport({
    //connection to your email provider (like Gmail).
    service: "gmail",
    auth: {
      // these are users login credentials.
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // receiver

  await transporter.sendMail({
    // uper vala sender thaa , ye vala reciever hai
    from: `"Mapple Support" <${process.env.EMAIL_USER}>`, // from: What the user sees in the "From" line of their inbox (e.g., "Mapple Support").
    to, //to: The recipient's email address (the one you got from req.body).
    subject: "learning forget password",
    html, // contenct section , written in implemented method  under send email function
  });
};

module.exports = sendEmail;
