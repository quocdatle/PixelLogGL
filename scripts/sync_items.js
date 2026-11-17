const path = require('path');
const backendDir = path.resolve(__dirname, '../backend');
require(path.join(backendDir, 'node_modules/dotenv')).config({ path: path.join(backendDir, '.env') });
const mongoose = require(path.join(backendDir, 'node_modules/mongoose'));
const Item = require(path.join(backendDir, 'src/modules/economy/item.model'));
const { SEED_ITEMS } = require(path.join(backendDir, 'database/seeders/items.seed'));

async function sync() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let inserted = 0;
    let updated = 0;

    for (const item of SEED_ITEMS) {
      const res = await Item.updateOne(
        { name: item.name },
        { $set: item },
        { upsert: true }
      );
      if (res.upsertedCount > 0) {
        console.log(`[INSERT] Added new item: ${item.name} (${item.rarity}, ${item.coinValue} Xu)`);
        inserted++;
      } else if (res.modifiedCount > 0) {
        console.log(`[UPDATE] Updated item: ${item.name}`);
        updated++;
      }
    }

    const totalInDb = await Item.countDocuments();
    console.log(`Sync complete! Total items in DB: ${totalInDb} (New inserted: ${inserted}, Updated: ${updated})`);

    const mist = await Item.findOne({ name: 'Mistsplitter Reforged' });
    console.log('Verified Mistsplitter in DB:', mist ? mist.toObject() : 'NOT FOUND');
  } catch (err) {
    console.error('Error syncing items:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

sync();
