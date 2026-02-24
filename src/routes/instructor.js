const express = require("express");
const router = express.Router();
const {
  getMyCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/controllers/inractorController");
const upload = require("../middleware/upload");
const { instructorOnly } = require("../middleware/protect");

router.get("/all/:id", instructorOnly, getMyCourses);

router.get("/:id", instructorOnly, getCourse);

router.post("/:id", instructorOnly, upload.single("thumbnail"), createCourse);

router.put("/:id", instructorOnly, upload.single("thumbnail"), updateCourse);

router.delete("/:id", instructorOnly, deleteCourse);

module.exports = router;
