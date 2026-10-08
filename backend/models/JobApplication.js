const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  applicantId: {
    type: String,
    required: true
  },
  applicantName: {
    type: String,
    required: true
  },
  applicantEmail: {
    type: String,
    required: true
  },
  applicantPhone: {
    type: String
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  region: {
    type: String
  },
  position: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  expectedSalary: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    type: String
  },
  adminName: {
    type: String
  },
  respondedAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

jobApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
