const mongoose = require('../server/node_modules/mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/zylo');
  const users = await mongoose.connection.db.collection('users').find({}, { projection: { email: 1, role: 1, accountType: 1, status: 1 } }).toArray();
  console.log('All Users:', users);
  await mongoose.disconnect();
}

main().catch(console.error);
