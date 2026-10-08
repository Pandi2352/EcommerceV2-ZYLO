const mongoose = require('../server/node_modules/mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/zylo');
  const res = await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@zylo.internal' },
    { $set: { failedLoginAttempts: 0, lockUntil: null } }
  );
  console.log('Unlocked admin@zylo.internal:', res);
  await mongoose.disconnect();
}

main().catch(console.error);
