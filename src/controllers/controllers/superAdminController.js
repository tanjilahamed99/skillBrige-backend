const Course = require("../../modals/Course");
const User = require("../../modals/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json({
      success: true,
      admins,
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, name and password are required",
      });
    }
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }
    const newAdmin = new User({
      email,
      name,
      password,
      role: "admin",
    });
    await newAdmin.save();
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        status: newAdmin.status,
      },
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id, email, name, password, status } = req.body;
    if (!email || !id) {
      return res.status(400).json({
        success: false,
        message: "Email and id are required",
      });
    }

    const admin = await User.findById(id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    admin.email = email;
    if (name) admin.name = name;
    if (password) admin.password = password;
    if (status) admin.status = status;
    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Admin id is required",
      });
    }
    const admin = await User.findById(id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email");
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    const { status } = req.body;
    const update = {
      $set: {
        status,
      },
    };
    const updateCourse = await Course.findByIdAndUpdate({ _id: id }, update);
    res.status(200).json({
      success: true,
      course: updateCourse,
      message: "Course status updated successfully",
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.superAdminAnalysis = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();

    // You have a students array with paymentStatus field
//     const totalRevenueResult = await Course.aggregate([
//       { $match: { status: "published" } },
//       {
//         $project: {
//           price: 1,
//           // Count students with 'paid' payment status
//           paidStudents: {
//             $size: {
//               $filter: {
//                 input: "$students",
//                 as: "student",
//                 cond: { $eq: ["$$student.paymentStatus", "paid"] },
//               },
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           total: {
//             $sum: { $multiply: ["$price", "$paidStudents"] },
//           },
//         },
//       },
//     ]);

//     const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Get total enrollments (total number of students across all published courses)
//     const totalEnrollmentResult = await Course.aggregate([
//       { $match: { status: "published" } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: { $size: "$students" } },
//         },
//       },
//     ]);

//     const totalEnrollment = totalEnrollmentResult[0]?.total || 0;

    // Get top instructors with their stats
//     const topInstructors = await User.aggregate([
//       { $match: { role: "instructor" } },
//       {
//         $lookup: {
//           from: "courses",
//           localField: "_id",
//           foreignField: "instructor",
//           as: "courses",
//         },
//       },
//       {
//         $project: {
//           name: 1,
//           email: 1,
//           picture: 1,
//           // Total courses created
//           totalCourses: { $size: "$courses" },

//           // Calculate total students across all their courses
//           totalStudents: {
//             $sum: {
//               $map: {
//                 input: "$courses",
//                 as: "course",
//                 in: { $size: "$$course.students" },
//               },
//             },
//           },

//           // Calculate total revenue (price * number of paid students)
//           totalRevenue: {
//             $sum: {
//               $map: {
//                 input: "$courses",
//                 as: "course",
//                 in: {
//                   $multiply: [
//                     "$$course.price",
//                     {
//                       $size: {
//                         $filter: {
//                           input: "$$course.students",
//                           as: "student",
//                           cond: { $eq: ["$$student.paymentStatus", "paid"] },
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           },

//           // Average completion rate
//           avgCompletionRate: {
//             $avg: {
//               $map: {
//                 input: "$courses",
//                 as: "course",
//                 in: {
//                   $cond: [
//                     { $gt: [{ $size: "$$course.students" }, 0] },
//                     {
//                       $multiply: [
//                         {
//                           $divide: [
//                             "$$course.totalCompletions",
//                             { $size: "$$course.students" },
//                           ],
//                         },
//                         100,
//                       ],
//                     },
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//         },
//       },
//       { $match: { totalCourses: { $gt: 0 } } }, // Only instructors with courses
//       { $sort: { totalRevenue: -1 } },
//       { $limit: 5 },
//     ]);

    res.status(200).json({
      success: true,
      totalUsers,
      totalCourses,
//       totalRevenue,
//       totalEnrollment,
//       topInstructors,
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
