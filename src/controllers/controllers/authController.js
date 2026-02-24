const jwt = require("jsonwebtoken");
const User = require("../../modals/User");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign(id, process.env.AUTH_SECRET, { expiresIn: "7d" });
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, name and role are required" });
    }

    if (role !== "student" && role !== "instructor") {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
      name,
      role,
    });

    await user.save();
    // remove password from output
    const { password: _, ...userWithoutPass } = user.toObject();

    res.status(201).json({
      user: userWithoutPass,
      token: generateToken({ id: user._id, email: user.email }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User found:", {
      email: user.email,
      hasPassword: !!user.password,
    });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userWithoutPass = user.toObject();
    delete userWithoutPass.password;

    res.json({
      user: userWithoutPass,
      token: generateToken({ id: user._id, email: user.email }),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     user.resetPasswordOTP = otp;
//     user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
//     await user.save();

//     // Send email
//     await sendEmail(
//       user.email,
//       "Password Reset OTP",
//       `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
//     );

//     res.json({ message: "OTP sent to email" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Reset password
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, code, password } = req.body;

//     const user = await User.findOne({
//       email,
//       resetPasswordOTP: code,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user)
//       return res.status(400).json({ message: "Invalid or expired OTP" });

//     user.password = password;
//     user.resetPasswordOTP = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({ message: "Password reset successful" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Change password
// exports.changePassword = async (req, res) => {
//   try {
//     const { email, newPassword, password } = req.body;

//     if (!email || !newPassword || !password) {
//       return res.status(400).json({
//         message: "Email, current password and new password are required",
//       });
//     }
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = password === newPassword;
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     user.password = newPassword;
//     await user.save();

//     res.json({ message: "Password changed successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
