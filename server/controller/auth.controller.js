// note:-  go to users  table there i have commneted  things in brief , in rest model i only commneted new things which were not in users model

const { User } = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // inbuilt feature ,  used to hash the forgot password token
const bcrypt = require("bcryptjs"); // installed feature , used to hash password
const { Op } = require("sequelize");
const sendEmail = require("../utils/nodeMailer");



exports.signup = async (req, res) => {

  try {
      const file = req.file;
   let imageUrl = null;
    if (file) {
  imageUrl = `/public/user-images/${file.filename}`;
}
    const { full_name, email, password, phone_number } = req.body;

     // ✅  Required field validation
    if (!full_name || !email || !password || !phone_number) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
// ✅  Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    // check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        message: "email already registerd",
      });
    }
    //2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // higher value means higher leverl of encryption

    //3. create user
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      phone_number,
       profile_image_url: imageUrl,
    });

    //4.   send response
    return res.status(201).json({
      message: "signup successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile_image_url: newUser.profile_image_url
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "signup failed",
      error: error.message,
    });
  }
};

// login page ----------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    //3. genrate jwt
   // jwt.sign() takes payload and secret as input, and generates header + signature automatically
    // header is autogenrted -  "alg": "HS256",  "type": "JWT"    
    // payload is  id and role  
    // secret key is in env file. 
    // Signature = hash( Header + Payload + Secret key )      Final output is a single string - SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    // Token = Header + Payload + Signature                    Final output is a single string - gsefKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    // hence lookwise both signature and token may looks similar  but , in  functionality both  strings are diffrent
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "9d" }
    );

    //4. if successfull then send response
    return res.status(200).json({
      message: "login successful bro",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "login failed",
      error: error.message,
    });
  }
};

//forgot password----------------------------------------------------------------------------------------------

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body; // this is the email where i will send the recovery password link
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 1. genrate random hash token   ,  eg- 4c8ae42e106800a7d37ff5f1a1a4938d... , unique   in hexadecimal , 32 is level of randomness
    const resetToken = crypto.randomBytes(32).toString("hex");

    // note- ye upr vala reset token bhejte hum as a email token , or database me store krne se pehle isko convert krte into unique hashed otput -->then again in to hexademial,and store in db, doing this so that agar hacker se database hack ho gyaa toh usko original otp kaa access na ho, to change the password.

    // 2 using crypto  to hash token before saving in db
    const hashedToken = crypto
      .createHash("sha256") // sha356 is the algorithm being used here , it converts the originaal hexademical string in to  unique hashed output so cant be revesed for decoding
      .update(resetToken) // not updating the above const resetToken , only feeds a copy of the value into the hash engine ,“Hey hash machine, here is some data — process it internally”
      .digest("hex"); //  hex tells that the above hashed result should be in hexadecimal format

    // 3. save token & expiry token in DB
    user.reset_password_token = hashedToken;
    user.reset_password_expires = Date.now() + 15 * 60 * 1000; //15 minutes

    await user.save();

    // 4.  this is the reset link that i will send to the user in his mail to reset his password
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // console.log("Reset link:", resetLink);

    // 5. Send email // using method from  sendEmail
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.full_name || "User"},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore.</p>
      `,
    });

    return res.status(200).json({
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error occured in the process of forgot password",
      error: error.message,
    });
  }
};

// the above api is to send the user link to reset password
// here i will reset the password after opnening the mail.

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    // here we are getting the token send by user(he got from email) , now same process se isko unique hash kiya nd converted to hexadecimal and then compared with database  vala hashed token.
    // see here we are skiping the first step jo uper kiya thaa

    // 1. genrate random hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. comparing the  valid user with database user , writing query to the database
    const user = await User.findOne({
      where: {
        reset_password_token: hashedToken,
        reset_password_expires: { [Op.gt]: Date.now() }, // Op.gt is a sequelize  operator  , means greator  than.   it compares the current date with date stored in database . if database date is still greater then we are valid otherwise  expired and invalid
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "token is invalid or expired",
      });
    }

    //  hash new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // now the work is done so we need to destroy the token or expiry date , so after changing of password the reset link will not work.
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error to resent password",
      error: error.message,
    });
  }
};





// resend otp_______________________________________________________________________________________________________________________________________

exports.resendResetPasswordToken = async (req, res) => {
     try {

      const {email} = req.body;
      const user = await User.findOne({where:{email}});

      if(!user){
        return res.status(404).json({
          message:"user not found",
        });
      }
  

const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
      

    user.reset_password_token = hashedToken;
    user.reset_password_expires = Date.now() + 15 * 60 * 1000; // 15 minutes


     await user.save();

const resetLink = `http://localhost:3000/reset-password/${resetToken}`;


await sendEmail({
      to: email,
      subject: "Resend Password Reset Link",
      html: `
        <p>Hello ${user.full_name || "User"},</p>
        <p>You requested a new password reset link.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });


     return res.status(200).json({
      message: "Password reset link resent successfully",
    });


     } catch (error) {
      console.log(error);
      return res.status(500).json({
        message:"erorr while resending reset link",
        error: error.message
      });
      
     }
}