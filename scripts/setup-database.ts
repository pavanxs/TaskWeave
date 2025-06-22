import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('📦 Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Configure your API keys in the application');
    console.log('2. Set up your Clerk authentication');
    console.log('3. Start creating workflows with Nodit MCP and AI blocks');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

export default setupDatabase; 