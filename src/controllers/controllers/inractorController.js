const Course = require("../../modals/Course");
const User = require("../../modals/User");
const mongoose = require("mongoose");

exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price, isFree, status } =
      req.body;
    const instructorId = req.params.id;

    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, and category",
      });
    }

    let thumbnailUrl = null;
    if (req.file) {
      thumbnailUrl = req.file.path; 
    }


    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create new course
    const newCourse = new Course({
      title,
      slug,
      description,
      category,
      level: level || "beginner",
      price: isFree === "true" ? 0 : price || 0,
      isFree: isFree === "true",
      thumbnail: thumbnailUrl,
      instructor: instructorId,
      status: status || "draft",
    });

    await newCourse.save();

    // Add course to instructor's createdCourses array
    instructor.createdCourses.push({
      courseId: newCourse._id,
      status: status || "draft",
    });
    await instructor.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

// ==================== UPDATE COURSE ====================
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const instructorId = req.user.id;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // Find course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own courses",
      });
    }

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.instructor;
    delete updates.createdAt;

    // Update slug if title changes
    if (updates.title) {
      updates.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Handle thumbnail update
    if (req.file) {
      updates.thumbnail = req.file.path; // New Cloudinary URL
    }

    // Handle price based on isFree
    if (updates.isFree === "true") {
      updates.price = 0;
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true },
    );

    // Update status in instructor's createdCourses
    if (updates.status) {
      await User.updateOne(
        {
          _id: instructorId,
          "createdCourses.courseId": id,
        },
        {
          $set: { "createdCourses.$.status": updates.status },
        },
      );
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==================== DELETE COURSE ====================
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // Find course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own courses",
      });
    }

    // Check if there are enrolled students
    const enrolledStudents = await User.countDocuments({
      "enrolledCourses.courseId": id,
    });

    if (enrolledStudents > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete course with enrolled students. Archive it instead.",
      });
    }

    // Remove course from instructor's createdCourses
    await User.updateOne(
      { _id: instructorId },
      { $pull: { createdCourses: { courseId: id } } },
    );

    // Delete the course
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==================== CHANGE COURSE STATUS ====================
exports.changeCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const instructorId = req.user.id;

    // Validate status
    const validStatuses = ["draft", "pending", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // Find course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You can only change status of your own courses",
      });
    }

    // Additional validation for publishing
    if (status === "published") {
      // Check if course has thumbnail
      if (!course.thumbnail) {
        return res.status(400).json({
          success: false,
          message: "Course must have a thumbnail before publishing",
        });
      }

      // Check if course has at least one lesson
      const Lesson = require("../models/Lesson");
      const lessonsCount = await Lesson.countDocuments({ courseId: id });

      if (lessonsCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Course must have at least one lesson before publishing",
        });
      }
    }

    // Update course status
    course.status = status;

    // Set timestamps based on status
    if (status === "published") {
      course.publishedAt = Date.now();
    } else if (status === "archived") {
      course.archivedAt = Date.now();
    }

    await course.save();

    // Update status in instructor's createdCourses
    await User.updateOne(
      {
        _id: instructorId,
        "createdCourses.courseId": id,
      },
      {
        $set: { "createdCourses.$.status": status },
      },
    );

    res.status(200).json({
      success: true,
      message: `Course status changed to ${status}`,
      data: course,
    });
  } catch (err) {
    console.error("Change course status error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==================== GET INSTRUCTOR'S COURSES ====================
exports.getMyCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { status } = req.query;

    const query = { instructor: instructorId };
    if (status) query.status = status;

    const courses = await Course.find(query).sort({ createdAt: -1 });

    // Get enrollment counts for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrolledStudents = await User.countDocuments({
          "enrolledCourses.courseId": course._id,
        });

        return {
          ...course.toObject(),
          enrolledStudents,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: coursesWithStats,
    });
  } catch (err) {
    console.error("Get my courses error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==================== GET SINGLE COURSE (for instructor) ====================
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findOne({
      _id: id,
      instructor: instructorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    console.error("Get course error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
