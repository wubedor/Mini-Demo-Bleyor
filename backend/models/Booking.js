const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Simple booking fields for frontend form
  customer: {
    name: String,
    phone: String,
    email: String
  },
  service: String,
  serviceName: String,
  address: String,
  date: Date,
  notes: String,
  deliveryOption: {
    type: String,
    enum: ['pickup', 'delivery', 'both'],
    default: 'both'
  },
  pickupLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  deliveryLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  userId: String,
  
  // Additional fields for future use
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  quantity: {
    type: Number,
    default: 1
  },
  basePrice: Number,
  totalPrice: Number,
  scheduledTime: String,
  estimatedDuration: {
    type: Number,
    default: 60
  },
  estimatedCompletion: Date,
  estimatedDelivery: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_money'],
    default: 'cash'
  },
  selectedOptions: [{
    name: String,
    value: String
  }],
  itemsList: [{
    name: String,
    quantity: Number,
    notes: String
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timeline: [{
    status: String,
    timestamp: Date,
    notes: String,
    updatedBy: mongoose.Schema.Types.ObjectId
  }],
  confirmedAt: Date,
  assignedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['customer', 'admin']
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
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate tracking number before saving
bookingSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'BL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
