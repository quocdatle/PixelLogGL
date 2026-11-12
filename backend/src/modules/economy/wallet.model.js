const mongoose = require('mongoose');

const MAX_COIN_PER_DAY = 250;
const DAILY_REWARD_AMOUNT = 150;
const INITIAL_BALANCE = 500;

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
      default: INITIAL_BALANCE,
    },
    totalEarned: {
      type: Number,
      default: INITIAL_BALANCE,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    keys: {
      standard: {
        type: Number,
        default: 0,
        min: 0,
      },
      cyber: {
        type: Number,
        default: 0,
        min: 0,
      },
      mythic: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    lastDailyReward: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
module.exports.MAX_COIN_PER_DAY = MAX_COIN_PER_DAY;
module.exports.DAILY_REWARD_AMOUNT = DAILY_REWARD_AMOUNT;
module.exports.INITIAL_BALANCE = INITIAL_BALANCE;
