const mongoose = require("mongoose");
const Course = require("../../modals/Course");
const User = require("../../modals/User");

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "published" }).populate(
      "instructor",
      "name email",
    );
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (err) {
    console.error("Get all courses error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseData = await Course.findById(courseId);

    // Fix: Convert both to string for comparison
    const studentsEnrolled = courseData.students.find(
      (student) => student.studentId.toString() === req.user._id.toString(),
    );


    if (!studentsEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    res.status(200).json({
      success: true,
      courseData,
    });
  } catch (err) {
    console.error("Get course error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateLessonStatus = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseData = await Course.findById(courseId);

    const upData = req.body;

    const studentsEnrolled = courseData.students.find(
      (student) => student.studentId.toString() === req.user._id.toString(),
    );
    if (!studentsEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    const updateData = {
      $set: {
        enrolledCourses: [...upData],
      },
    };
    const updateUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      updateData,
    );

    res.status(200).json({
      success: true,
      user: updateUser,
    });
  } catch (err) {
    console.error("Get course error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.enrollCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.status !== "published") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment",
      });
    }

    const alreadyEnrolled = course.students?.some(
      (student) => student.studentId?.toString() === userId.toString(),
    );

    if (alreadyEnrolled) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Update course
    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          students: {
            studentId: userId,
            enrolledAt: new Date(),
            progress: 0,
            status: "enrolled",
            paymentStatus: course.isFree ? "paid" : "paid",
          },
        },
        $inc: { totalEnrollments: 1 },
      },
      { session, new: true },
    );

    // Update user
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          enrolledCourses: {
            courseId: courseId,
            enrolledAt: new Date(),
            status: "active",
            progress: 0,
            completedLessons: [],
            paymentStatus: course.isFree ? "completed" : "pending",
            paymentAmount: course.price,
          },
        },
      },
      { session, new: true },
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: course.isFree
        ? "Successfully enrolled in the course"
        : "Course enrollment pending payment",
      data: {
        courseId: course._id,
        title: course.title,
        requiresPayment: !course.isFree,
        price: course.price,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Enrollment error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to enroll in course",
    });
  } finally {
    session.endSession();
  }
};

// Get overall student dashboard stats
exports.getStudentDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user with populated enrolled courses
    const user = await User.findById(userId).populate({
      path: "enrolledCourses.courseId",
      model: "Course",
      select: "title thumbnail instructor totalLessons price category level",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all enrolled courses with details
    const enrolledCourses = await Promise.all(
      user.enrolledCourses.map(async (enrollment) => {
        const course = await Course.findById(enrollment.courseId)
          .populate("instructor", "name email picture")
          .lean();

        if (!course) return null;

        // Get total lessons count
        let lessons = [];
        try {
          lessons = JSON.parse(course.lesson || "[]");
        } catch (e) {
          console.error("Error parsing lessons:", e);
        }

        const totalLessons = lessons.length;
        const completedLessons = enrollment.completedLessons?.length || 0;
        const progress =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        // Find next incomplete lesson
        const nextLesson = lessons.find(
          (lesson) =>
            !enrollment.completedLessons?.includes(lesson.order.toString()),
        );

        return {
          courseId: course._id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          instructor: course.instructor,
          category: course.category,
          level: course.level,
          price: course.price,
          isFree: course.isFree,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress,
          completedLessons: enrollment.completedLessons || [],
          totalLessons,
          nextLesson: nextLesson
            ? {
                _id: nextLesson._id,
                title: nextLesson.title,
                order: nextLesson.order,
                duration: nextLesson.duration,
              }
            : null,
          lastAccessed: enrollment.lastAccessed,
          paymentStatus: enrollment.paymentStatus,
          paymentAmount: enrollment.paymentAmount,
        };
      }),
    );

    // Filter out null values (in case any course was deleted)
    const validEnrollments = enrolledCourses.filter((c) => c !== null);

    // Calculate statistics
    const stats = {
      totalEnrolledCourses: validEnrollments.length,
      activeCourses: validEnrollments.filter((c) => c.status === "active")
        .length,
      completedCourses: validEnrollments.filter((c) => c.status === "completed")
        .length,
      droppedCourses: validEnrollments.filter((c) => c.status === "dropped")
        .length,

      // Progress statistics
      averageProgress:
        validEnrollments.length > 0
          ? Math.round(
              validEnrollments.reduce((sum, c) => sum + c.progress, 0) /
                validEnrollments.length,
            )
          : 0,

      totalCompletedLessons: validEnrollments.reduce(
        (sum, c) => sum + (c.completedLessons?.length || 0),
        0,
      ),

      totalLessons: validEnrollments.reduce(
        (sum, c) => sum + (c.totalLessons || 0),
        0,
      ),

      // Learning time (you would need to track this separately)
      totalLearningHours: 0, // To be implemented with time tracking

      // Certificates earned
      certificatesEarned: validEnrollments.filter(
        (c) => c.status === "completed",
      ).length,

      // Completion rate
      completionRate:
        validEnrollments.length > 0
          ? Math.round(
              (validEnrollments.filter((c) => c.status === "completed").length /
                validEnrollments.length) *
                100,
            )
          : 0,

      // Category distribution
      categoryDistribution: validEnrollments.reduce((acc, course) => {
        const category = course.category || "Other";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),

      // Level distribution
      levelDistribution: validEnrollments.reduce((acc, course) => {
        const level = course.level || "beginner";
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
        enrolledCourses: validEnrollments,
      },
    });
  } catch (err) {
    console.error("Error getting student dashboard stats:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
