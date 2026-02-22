const mongoose = require("mongoose");
const { Schema } = mongoose;

const CourseSchema = new Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, "Course title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, "Course description is required"],
    maxlength: [2000, "Description cannot exceed 2000 characters"]
  },
  shortDescription: {
    type: String,
    maxlength: [200, "Short description cannot exceed 200 characters"]
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, "Course category is required"],
    enum: [
      'Web Development',
      'Data Science', 
      'UI/UX Design',
      'Mobile Development',
      'Cloud Computing',
      'Digital Marketing',
      'Business',
      'Photography',
      'Music',
      'Other'
    ]
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'English'
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Media
  thumbnail: {
    type: String,
    default: null
  },
  thumbnailPublicId: {
    type: String, // For Cloudinary deletion
    select: false
  },
  previewVideo: {
    type: String,
    default: null
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountedPrice: {
    type: Number,
    default: function() {
      return this.discount > 0 ? this.price * (1 - this.discount / 100) : this.price;
    }
  },
  
  // Instructor (references your User model)
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Course Content Stats
  totalLessons: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Learning Objectives
  whatYouWillLearn: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],
  
  // Materials
  materialsIncluded: [{
    type: String,
    enum: ['Videos', 'Articles', 'Quizzes', 'Assignments', 'Coding Exercises', 'Projects', 'Certificates']
  }],
  
  // Status (matches your createdCourses.status in User schema)
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Timestamps
  publishedAt: {
    type: Date,
    default: null
  },
  archivedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  submittedForReviewAt: {
    type: Date,
    default: null
  },
  
  // SEO
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [String],
  
  // Analytics
  totalEnrollments: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCompletions: {
    type: Number,
    default: 0,
    min: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  
  // Settings
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1
  },
  
  // Who approved/rejected (admin)
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date

}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug before saving
CourseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Set discounted price
  if (this.isModified('price') || this.isModified('discount')) {
    this.discountedPrice = this.discount > 0 
      ? this.price * (1 - this.discount / 100) 
      : this.price;
  }
  
  // Set isNew flag based on creation date
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.isNew = this.createdAt > thirtyDaysAgo;
  
  next();
});

// Virtual populate lessons (you'll create this model separately)
CourseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'courseId',
  options: { sort: { order: 1 } }
});

// Virtual for enrolled students count (from User model)
CourseSchema.virtual('enrolledStudents', {
  ref: 'User',
  localField: '_id',
  foreignField: 'enrolledCourses.courseId',
  count: true
});

// Virtual for completion rate
CourseSchema.virtual('completionRate').get(function() {
  if (this.totalEnrollments === 0) return 0;
  return Math.round((this.totalCompletions / this.totalEnrollments) * 100);
});

// Indexes for better query performance
CourseSchema.index({ title: 'text', description: 'text' }); // Text search
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ averageRating: -1 });
CourseSchema.index({ isFeatured: 1, isBestseller: 1 });
CourseSchema.index({ status: 1, publishedAt: -1 });
CourseSchema.index({ instructor: 1, status: 1 }); // Important for your queries

// Static method to get popular courses
CourseSchema.statics.getPopularCourses = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ totalEnrollments: -1, averageRating: -1 })
    .limit(limit)
    .populate('instructor', 'name email picture');
};

// Instance method to update analytics
CourseSchema.methods.updateAnalytics = async function() {
  const User = mongoose.model('User');
  
  // Get enrollment stats
  const enrollments = await User.aggregate([
    { $unwind: '$enrolledCourses' },
    { $match: { 'enrolledCourses.courseId': this._id } },
    { 
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        totalCompletions: { 
          $sum: { $cond: [{ $eq: ['$enrolledCourses.status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  if (enrollments.length > 0) {
    this.totalEnrollments = enrollments[0].totalEnrollments;
    this.totalCompletions = enrollments[0].totalCompletions;
  }

  // Get average rating (you'll need a Review model for this)
  // This is a placeholder for when you add reviews
  // const Review = mongoose.model('Review');
  // const ratingStats = await Review.aggregate([
  //   { $match: { courseId: this._id } },
  //   { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  // ]);

  await this.save();
};

// Method to check if user is enrolled
CourseSchema.methods.isUserEnrolled = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findOne({
    _id: userId,
    'enrolledCourses.courseId': this._id
  });
  return !!user;
};

// Method to get course progress for a user
CourseSchema.methods.getUserProgress = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findOne(
    { _id: userId, 'enrolledCourses.courseId': this._id },
    { 'enrolledCourses.$': 1 }
  );
  return user?.enrolledCourses[0]?.progress || 0;
};

module.exports = mongoose.model("Course", CourseSchema);