const Course = require("../../modals/Course");
const User = require("../../modals/User");

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
    const { courseId } = req.params;
    const course = await Course.findOne({ _id: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    const { status } = req.body;
    const update = {
      $set: {
        status: status,
      },
    };
    const updateCourse = await Course.findByIdAndUpdate(
      { _id: courseId },
      update,
    );
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
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Email and id are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    if (status) user.status = status;
    await user.save();

    res.status(201).json({
      success: true,
      message: "user updated successfully",
      user,
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["student", "instructor"] },
    }).select("-password");
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

exports.adminAnalysis = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({
      status: "published",
    });
    const pendingCourses = await Course.countDocuments({ status: "pending" });
    const draftCourses = await Course.countDocuments({ status: "draft" });
    const archivedCourses = await Course.countDocuments({ status: "archived" });

    // 2. Revenue Calculation (only from paid students in published courses)
    const totalRevenueResult = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $project: {
          price: 1,
          paidStudents: {
            $size: {
              $filter: {
                input: "$students",
                as: "student",
                cond: { $eq: ["$$student.paymentStatus", "paid"] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$paidStudents"] } },
        },
      },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 3. Total Enrollments (all students across all published courses)
    const totalEnrollmentResult = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $size: "$students" } },
        },
      },
    ]);
    const totalEnrollments = totalEnrollmentResult[0]?.total || 0;

    // 4. Course Completion Stats
    const completionStats = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: null,
          totalCompletions: { $sum: "$totalCompletions" },
          avgCompletionRate: { $avg: "$completionRate" },
        },
      },
    ]);
    const totalCompletions = completionStats[0]?.totalCompletions || 0;
    const averageCompletionRate = completionStats[0]?.avgCompletionRate || 0;

    // 5. Category Distribution
    const categoryDistribution = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          students: { $sum: { $size: "$students" } },
          revenue: {
            $sum: {
              $multiply: [
                "$price",
                {
                  $size: {
                    $filter: {
                      input: "$students",
                      as: "student",
                      cond: { $eq: ["$$student.paymentStatus", "paid"] },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 6. Level Distribution
    const levelDistribution = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
          students: { $sum: { $size: "$students" } },
        },
      },
    ]);

    // 7. Monthly Growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUserGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyCourseGrowth = await Course.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 8. Top Instructors
    const topInstructors = await User.aggregate([
      { $match: { role: "instructor" } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "instructor",
          as: "courses",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          picture: 1,
          // Total courses created
          totalCourses: { $size: "$courses" },
          // Published courses
          publishedCourses: {
            $size: {
              $filter: {
                input: "$courses",
                as: "course",
                cond: { $eq: ["$$course.status", "published"] },
              },
            },
          },
          // Total students across all courses
          totalStudents: {
            $sum: {
              $map: {
                input: "$courses",
                as: "course",
                in: { $size: "$$course.students" },
              },
            },
          },
          // Total revenue
          totalRevenue: {
            $sum: {
              $map: {
                input: "$courses",
                as: "course",
                in: {
                  $multiply: [
                    "$$course.price",
                    {
                      $size: {
                        $filter: {
                          input: "$$course.students",
                          as: "student",
                          cond: { $eq: ["$$student.paymentStatus", "paid"] },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          // Average rating
          avgRating: { $avg: "$courses.averageRating" },
        },
      },
      { $match: { publishedCourses: { $gt: 0 } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // 9. Popular Courses
    const popularCourses = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $project: {
          title: 1,
          thumbnail: 1,
          price: 1,
          isFree: 1,
          instructor: 1,
          category: 1,
          level: 1,
          totalEnrollments: { $size: "$students" },
          totalCompletions: 1,
          averageRating: 1,
          totalReviews: 1,
          revenue: {
            $multiply: [
              "$price",
              {
                $size: {
                  $filter: {
                    input: "$students",
                    as: "student",
                    cond: { $eq: ["$$student.paymentStatus", "paid"] },
                  },
                },
              },
            ],
          },
        },
      },
      { $sort: { totalEnrollments: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructorDetails",
        },
      },
      {
        $addFields: {
          instructorName: { $arrayElemAt: ["$instructorDetails.name", 0] },
        },
      },
      { $project: { instructorDetails: 0 } },
    ]);

    // 10. Recent Activities
    const recentEnrollments = await Course.aggregate([
      { $unwind: "$students" },
      { $sort: { "students.enrolledAt": -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "students.studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructorDetails",
        },
      },
      {
        $project: {
          courseTitle: "$title",
          studentName: { $arrayElemAt: ["$studentDetails.name", 0] },
          instructorName: { $arrayElemAt: ["$instructorDetails.name", 0] },
          enrolledAt: "$students.enrolledAt",
          type: { $literal: "enrollment" },
        },
      },
    ]);

    const recentCourseCreations = await Course.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructorDetails",
        },
      },
      {
        $project: {
          courseTitle: "$title",
          instructorName: { $arrayElemAt: ["$instructorDetails.name", 0] },
          createdAt: 1,
          type: { $literal: "course_creation" },
        },
      },
    ]);

    // Combine and sort recent activities
    const recentActivities = [...recentEnrollments, ...recentCourseCreations]
      .sort(
        (a, b) =>
          new Date(b.enrolledAt || b.createdAt) -
          new Date(a.enrolledAt || a.createdAt),
      )
      .slice(0, 10);

    // 11. Platform Overview
    const platformOverview = {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      publishedCourses,
      pendingCourses,
      draftCourses,
      archivedCourses,
      totalEnrollments,
      totalCompletions,
      totalRevenue,
      averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
    };

    // 12. Growth Trends
    const growthTrends = {
      users: monthlyUserGrowth.map((item) => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
        count: item.count,
      })),
      courses: monthlyCourseGrowth.map((item) => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
        count: item.count,
      })),
    };

    // Send response
    res.status(200).json({
      success: true,
      data: {
        overview: platformOverview,
        distribution: {
          categories: categoryDistribution,
          levels: levelDistribution,
        },
        topInstructors,
        popularCourses,
        recentActivities,
        growthTrends,
      },
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch analytics",
    });
  }
};
