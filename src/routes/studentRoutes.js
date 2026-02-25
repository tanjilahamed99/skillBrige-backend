const express = require("express");

const {
  getAllCourses,
  enrollCourse,
  getCourse,
  updateLessonStatus,
  getStudentDashboardStats,
} = require("../controllers/controllers/studentController");
const { studentOnly } = require("../middleware/protect");

const router = express.Router();

router.get("/courses", getAllCourses);
router.get("/course/:courseId", studentOnly, getCourse);
router.put("/course/lesson/:courseId", studentOnly, updateLessonStatus);

router.post("/enroll/:courseId", studentOnly, enrollCourse);

router.get("/stats", studentOnly, getStudentDashboardStats);

module.exports = router;
