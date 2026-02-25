const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middleware/protect");
const {
  getAllUsers,
  adminAnalysis,
  deleteUser,
  getAllCourses,
  updateCourse,
  updateUserStatus,
} = require("../controllers/controllers/adminController");

router.get("/analysis", adminOnly, adminAnalysis);
router.get("/users", adminOnly, getAllUsers);
router.delete("/user", adminOnly, deleteUser);
router.put("/user/:userId", adminOnly, updateUserStatus);
router.get("/course", adminOnly, getAllCourses);
router.put("/course/:courseId", adminOnly, updateCourse);

module.exports = router;
