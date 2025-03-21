const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();
//send otp
exports.sendOTP = async (req, res) => {
  try {
    // fetch email from req body
    const { email } = req.body;

    //check if user already exists
    const checkUserPresent = await User.findOne({ email });

    // if user already exists then return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "user already exist",
      });
    }
    //generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //check unique otp or not
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    //create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
   

    //   return response successfully
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signUp
exports.signUp = async (req, res) => {
  try {
    //fetch data from req body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(401).json({
        success: false,
        message: "All fields are requird",
      });
    }
    //password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "password and confirm password does not match , please try again ",
      });
    }

    //check user already exists or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user is already registered",
      });
    }

    //find most recent otp stored for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
   

    //validate otp
    if (recentOtp.length === 0) {
      // otp not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "invalid OTP ",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
   
    // Create the user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)


    //create entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dataofBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //return res
    return res.status(200).json({
      success: true,
      message: "user registered successfully ",
      user,
    });
  } catch (error) {
   
    return res.status(500).json({
      success: false,
      message: "usser cannot be registered, please try again later",
    });
  }
};

//Login

exports.login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      res.status(403).json({
        success: false,
        message: "All fields are required, try again",
      });
    }
    //user check exists or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "user is not registered, please signup first",
      });
    }
    //generate jwt,after password matching
    const result =await bcrypt.compare(password,user.password)
    console.log("email",result,req.body,user)
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      console.log("payload",payload)
      const token = jwt.sign(payload, process.env.JWT_SECRET,{
        expiresIn: "24h",
      });
      user.token = token;
      user.password = undefined;
      //create cookies and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      console.log('mgg gg ghmh hhhhhhhhhhhhhhhhhhhhhh')
      return res.status(401).json({
        success: false,
        message: "password is incorrect",
      });
    }
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Login failed , try again ",
    });
  }
};

//c

exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
   
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
