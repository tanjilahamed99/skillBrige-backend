const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // Basic Info
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    picture: {
      type: String,
      default: null,
    },
    qualification: String,
    bio: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,

    // Password Reset
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
    // Student Data
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "completed", "dropped"],
          default: "active",
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completedLessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
          },
        ],
        paymentStatus: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        paymentAmount: Number,
      },
    ],
    // Instructor Data
    createdCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        status: {
          type: String,
          enum: ["draft", "pending", "published", "rejected"],
          default: "draft",
        },
        publishedAt: Date,
        totalStudents: {
          type: Number,
          default: 0,
        },
        totalRevenue: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  },
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Check if user is enrolled in a course
UserSchema.methods.isEnrolled = function (courseId) {
  return this.enrolledCourses.some(
    (e) => e.courseId?.toString() === courseId.toString(),
  );
};

// Check if user owns a course (as instructor)
UserSchema.methods.ownsCourse = function (courseId) {
  return this.createdCourses.some(
    (c) => c.courseId?.toString() === courseId.toString(),
  );
};

// Indexes for better performance
UserSchema.index({ "enrolledCourses.courseId": 1 });
UserSchema.index({ "createdCourses.courseId": 1 });

module.exports = mongoose.model("User", UserSchema);
