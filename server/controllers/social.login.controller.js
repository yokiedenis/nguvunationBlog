const admin = require("firebase-admin");
const User = require("../models/user.model");
const generateOTP = require("../utils/generate_otp");
const sendEmail = require("../utils/send_email");

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
  }),
});

const socialLogin = async (req, res) => {
  try {
    const { userData, token, provider } = req.body;
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token:", decodedToken);

    // Handle Twitter's potential missing email
    const email = decodedToken.email || userData.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required. Twitter may not provide email addresses.",
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user with provider-specific data
      user = new User({
        name: userData.name,
        email,
        password: userData.password,
        profileImg: userData.profileImg,
        username: userData.username,
        isVerified: provider === 'twitter' ? true : userData.isVerified, // Twitter accounts are typically verified
        otp: generateOTP(),
        authProvider: provider, // Store the auth provider
        ...(provider === 'twitter' && { twitterId: decodedToken.uid }), // Store Twitter ID if available
      });

      await user.save();
      isNewUser = true;

      // Send OTP if needed
      if (!user.isVerified) {
        await sendEmail(
          user.email,
          "Verify your account",
          `Your OTP for account verification is: ${user.otp}`
        );
      }
    }

    // Generate JWT token
    const jwtToken = await user.generateToken();

    return res.status(200).json({
      success: true,
      message: isNewUser ? "Registration Successful" : "Login Successful",
      token: jwtToken,
      userId: user._id.toString(),
      isVerified: user.isVerified,
      isNewUser,
    });

  } catch (error) {
    console.error("Social login error:", error);
    
    // More specific error messages
    let errorMessage = "Login failed";
    if (error.code === 'auth/id-token-expired') {
      errorMessage = "Session expired. Please login again.";
    } else if (error.code === 'auth/argument-error') {
      errorMessage = "Invalid authentication token.";
    }

    return res.status(500).json({
      success: false,
      message: errorMessage || "Something went wrong",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  socialLogin,
};