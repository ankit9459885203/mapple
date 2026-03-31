const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");


// Register
router.post("/signup", upload.single("image"), authController.signup);

// Login
router.post("/login", authController.login);

// forget password
router.post("/forgotPassword" , authController.forgotPassword);

// reset password
router.post("/resetPassword", authController.resetPassword);

// resend  otp
router.post("/resendOtp" , authController.resendResetPasswordToken);


module.exports = router;
