import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { seedDemoData } from './demo-data.seed';

async function main() {
  console.log('Starting ZYLO Demo Data Seeder Runner...');
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zylo';
    await seedDemoData(mongoUri);
    console.log('Seeder finished successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('Seeder failed with error:', error?.message || error);
    process.exit(1);
  }
}

main();
