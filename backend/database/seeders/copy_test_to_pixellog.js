const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');

const SOURCE_DB = 'test';
const TARGET_DB = 'pixellog';

/**
 * Copy toàn bộ dữ liệu và index từ database `test` sang `pixellog`.
 * Dùng upsert theo `_id` để giữ nguyên toàn bộ `_id`, ObjectId liên kết,
 * `users`, `games`, `items`, `wallets`, `inventories`, `usergames` (kèm `playSessions`),
 * `caseopenlogs`, `advisorlogs` và không ghi đè mất các document riêng ở DB đích.
 */
async function copyDatabase() {
  await connectDB();

  const client = mongoose.connection.getClient();
  const sourceDb = client.db(SOURCE_DB);
  const targetDb = client.db(TARGET_DB);

  const collections = await sourceDb.listCollections().toArray();
  const collectionNames = collections
    .map((c) => c.name)
    .filter((name) => !name.startsWith('system.'));

  console.log(`[COPY] Bắt đầu copy ${collectionNames.length} collections từ '${SOURCE_DB}' -> '${TARGET_DB}'...`);

  for (const name of collectionNames) {
    const srcCol = sourceDb.collection(name);
    const dstCol = targetDb.collection(name);

    const docs = await srcCol.find({}).toArray();
    if (docs.length > 0) {
      const ops = docs.map((doc) => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true,
        },
      }));
      const result = await dstCol.bulkWrite(ops, { ordered: false });
      console.log(
        `  ✓ ${name}: ${docs.length} docs (inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, matched: ${result.matchedCount})`
      );
    } else {
      console.log(`  - ${name}: 0 docs`);
    }

    // Đồng bộ index (bỏ qua _id_)
    const indexes = await srcCol.indexes();
    for (const idx of indexes) {
      if (idx.name === '_id_') continue;
      const { key, name: idxName, ...options } = idx;
      delete options.v;
      delete options.ns;
      try {
        await dstCol.createIndex(key, { name: idxName, ...options });
      } catch (err) {
        console.warn(`  ! Bỏ qua index '${idxName}' trên '${name}': ${err.message}`);
      }
    }
  }

  // Kiểm tra đối chiếu sau khi copy
  console.log(`\n[VERIFY] Tổng số document hiện tại trong '${TARGET_DB}':`);
  for (const name of collectionNames) {
    const srcCount = await sourceDb.collection(name).countDocuments();
    const dstCount = await targetDb.collection(name).countDocuments();
    console.log(`  - ${name}: ${dstCount} (nguồn '${SOURCE_DB}': ${srcCount})`);
  }

  const testUser = await targetDb.collection('users').findOne({ username: 'test' });
  if (testUser) {
    const userGames = await targetDb.collection('usergames').find({ userId: testUser._id }).toArray();
    const totalSessions = userGames.reduce((sum, g) => sum + (g.playSessions?.length || 0), 0);
    const wallet = await targetDb.collection('wallets').findOne({ userId: testUser._id });
    const invCount = await targetDb.collection('inventories').countDocuments({ userId: testUser._id });
    console.log(
      `\n[VERIFY] Account 'test' trong '${TARGET_DB}': _id=${testUser._id}, usergames=${userGames.length}, playSessions=${totalSessions}, walletBalance=${wallet?.balance ?? 0}, inventories=${invCount}`
    );
  }

  console.log('\n[COPY] Hoàn tất!');
  process.exit(0);
}

copyDatabase().catch((err) => {
  console.error('[COPY] Lỗi khi copy database:', err);
  process.exit(1);
});
