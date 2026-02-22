const express = require("express");
const router = express.Router();
const {
  getMyCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  changeCourseStatus,
} = require("../controllers/controllers/inractorController");
const upload = require("../middleware/upload");

// router.get("/", getMyCourses);

// router.get("/:id", getCourse);

router.post("/:id", upload.single("thumbnail"), createCourse);

// router.put("/:id", upload.single("thumbnail"), updateCourse);

// router.delete("/:id", deleteCourse);

// router.patch("/:id/status", changeCourseStatus);

module.exports = router;
