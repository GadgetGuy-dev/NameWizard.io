const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('Creating agent_status enum if not exists...');
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_status') THEN
          CREATE TYPE agent_status AS ENUM ('idle', 'running', 'completed', 'failed');
        END IF;
      END
      $$;
    `);
    console.log('Agent status enum created or already exists.');
  } catch (error) {
    console.error('Error creating agent_status enum:', error);
  }
  
  console.log('Creating agent_type enum if not exists...');
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_type') THEN
          CREATE TYPE agent_type AS ENUM ('file_organizer', 'content_analyzer', 'batch_processor', 'custom');
        END IF;
      END
      $$;
    `);
    console.log('Agent type enum created or already exists.');
  } catch (error) {
    console.error('Error creating agent_type enum:', error);
  }
  
  console.log('Creating agents table if not exists...');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type agent_type NOT NULL,
        description TEXT NOT NULL,
        status agent_status NOT NULL DEFAULT 'idle',
        config JSONB,
        last_run TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Agents table created or already exists.');
  } catch (error) {
    console.error('Error creating agents table:', error);
  }
  
  console.log('Schema update complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error updating schema:', err);
  process.exit(1);
});