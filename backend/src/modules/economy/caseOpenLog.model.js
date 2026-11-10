const mongoose = require('mongoose');

const caseOpenLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    caseId: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

caseOpenLogSchema.index({ createdAt: -1 });

const CaseOpenLog = mongoose.model('CaseOpenLog', caseOpenLogSchema);

module.exports = CaseOpenLog;
