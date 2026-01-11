import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const LOCAL_DB_URL = process.env.DATABASE_URL;
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

if (!LOCAL_DB_URL || !SUPABASE_DB_URL) {
  console.error('Error: Missing DATABASE_URL (Local) or SUPABASE_DB_URL in .env.local');
  process.exit(1);
}

console.log('🔄 Starting Data Sync: Supabase -> Local...');
console.log('⚠️  This will overwrite your local database data!');

// Construct the command
// Note: We use --clean to drop existing objects before creating them
// We use --no-owner and --no-acl to avoid permission issues
const command = `pg_dump "${SUPABASE_DB_URL}" --clean --if-exists --no-owner --no-acl --quote-all-identifiers | psql "${LOCAL_DB_URL}"`;

const processRef = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Sync failed: ${error.message}`);
    return;
  }
  if (stderr) {
    // pg_dump/psql output often goes to stderr even on success
    console.log(`ℹ️  Log:\n${stderr}`);
  }
  console.log('✅ Data sync complete!');
});
