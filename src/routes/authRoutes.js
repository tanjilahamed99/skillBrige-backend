const express = require("express");
const {
  register,
  login
} = require("../controllers/controllers/authController");
// const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// router.get("/profile", protect, getProfile);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);
// router.post("/change-password", changePassword);
// router.post("/save-fcm-token", protect,saveFcmToken);

module.exports = router;
