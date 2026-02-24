const express = require("express");
const router = express.Router();
const { superAdminOnly } = require("../middleware/protect");
const {
  getAllUsers,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/controllers/superAdminController");

router.get("/users", superAdminOnly, getAllUsers);
router.get("/admins", superAdminOnly, getAllAdmins);
router.post("/admin/create", superAdminOnly, createAdmin);
router.put("/admin/update", superAdminOnly, updateAdmin);
router.delete("/admin/:id", superAdminOnly, deleteAdmin);

module.exports = router;
