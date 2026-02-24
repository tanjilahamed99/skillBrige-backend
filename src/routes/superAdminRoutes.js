const express = require("express");
const router = express.Router();
const { superAdminOnly } = require("../middleware/protect");
const {
  getAllUsers,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllCourses,
  updateCourse,
  superAdminAnalysis,
} = require("../controllers/controllers/superAdminController");

router.get("/users", superAdminOnly, getAllUsers);
router.get("/admins", superAdminOnly, getAllAdmins);
router.post("/admin/create", superAdminOnly, createAdmin);
router.put("/admin/update", superAdminOnly, updateAdmin);
router.delete("/admin/:id", superAdminOnly, deleteAdmin);
router.get("/courses", superAdminOnly, getAllCourses);
router.put("/courses/:id", superAdminOnly, updateCourse);


router.get("/analysis", superAdminOnly, superAdminAnalysis);

module.exports = router;
