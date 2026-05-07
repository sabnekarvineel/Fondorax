const mongoose = require('mongoose');

const eligibilityProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  // Startup Profile
  startupName: String,
  isRegistered: {
    type: Boolean,
    default: false,
  },
  registrationType: {
    type: String,
    enum: ['DPIIT', 'MSME', 'None'],
    default: 'None',
  },
  registrationNumber: String,
  registrationDate: Date,

  // Stage Information
  stage: {
    type: String,
    enum: ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scale'],
    default: 'Idea',
  },
  monthlyRevenue: Number, // in rupees
  annualRevenue: Number,

  // Sector Information
  sector: String, // Tech, EdTech, AgriTech, FinTech, HealthTech, etc.
  subsector: String,

  // Team Information
  teamSize: {
    type: Number,
    default: 1,
  },
  founderCount: {
    type: Number,
    default: 1,
  },
  hasFullTimeTeam: Boolean,

  // Location
  headquarterState: String, // Telangana, Karnataka, Maharashtra, etc.
  operatingStates: [String],

  // Specializations
  isFemaleFounder: Boolean,
  isFirstTimeFounder: Boolean,
  isSCSTStartup: Boolean,
  hasPatent: Boolean,
  hasTradeSecret: Boolean,

  // Financial Info
  currentFunding: Number, // Total raised so far
  cashBurn: Number, // Monthly burn rate
  hasRevenue: Boolean,
  businessModel: String,

  // Compliance
  hasTaxRegistration: Boolean,
  hasGSTRegistration: Boolean,
  isComplianceReady: Boolean,

  // Experience
  founderExperience: {
    type: Number, // years in industry
    default: 0,
  },
  previousStartups: {
    type: Number,
    default: 0,
  },

  // Calculated Eligibility Score
  eligibilityScore: {
    type: Number,
    default: 0, // 0-100
  },

  // Last Updated
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

eligibilityProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EligibilityProfile', eligibilityProfileSchema);
