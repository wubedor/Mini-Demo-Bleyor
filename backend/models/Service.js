const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    default: 60
  },
  category: {
    type: String,
    enum: ['laundry', 'dry_cleaning', 'ironing', 'special'],
    default: 'laundry'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }],
  options: [{
    name: String,
    choices: [{
      name: String,
      price: Number
    }]
  }],
  orderCount: {
    type: Number,
    default: 0
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

// Update the updatedAt timestamp before saving
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to increment order count
serviceSchema.methods.incrementOrderCount = function() {
  this.orderCount += 1;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);
