const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, unique: true },
  name: String,
  password: String,
  phone: String,
  role: { type: String, default: "user" },
  picture: { type: String, ref: "images" },
  price: { type: Number, default: 0 },
  qualification: String,
  createdAt: { type: Date, default: Date.now },
  // 🔑 Reset password fields
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
