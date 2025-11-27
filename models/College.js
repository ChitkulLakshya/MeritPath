const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'MECH'],
    uppercase: true
  },
  mcet_rank_cutoff: {
    type: Number,
    required: true,
    min: 0
  },
  intermediate_marks_cutoff: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  fees: {
    type: Number,
    min: 0
  },
  affiliation: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
collegeSchema.index({ course: 1, mcet_rank_cutoff: 1, intermediate_marks_cutoff: 1 });

module.exports = mongoose.model('College', collegeSchema);

