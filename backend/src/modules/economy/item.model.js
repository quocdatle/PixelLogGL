const mongoose = require('mongoose');

const ITEM_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const ITEM_TYPES = ['badge', 'avatar_frame', 'weapon', 'title', 'collectible'];

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '', trim: true },
    rarity: {
      type: String,
      enum: ITEM_RARITIES,
      default: 'common',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ITEM_TYPES,
      default: 'badge',
      required: true,
    },
    icon: { type: String, default: '🎁' },
    imageUrl: { type: String, default: null },
    coinValue: { type: Number, required: true, min: 10, default: 20 },
    caseType: { type: String, default: 'all' }, // 'all' | 'standard' | 'cyber' | 'mythic'
    dropRate: { type: Number, default: 100 }, // Trọng số rơi trong cùng tier
  },
  { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
module.exports.ITEM_RARITIES = ITEM_RARITIES;
module.exports.ITEM_TYPES = ITEM_TYPES;
