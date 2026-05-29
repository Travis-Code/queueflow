const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://boom@localhost:5432/queueflow';

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 3000,
  query_timeout: 3000,
  statement_timeout: 3000,
});

const hardTimeoutMs = 6000;
const hardTimeout = setTimeout(() => {
  console.error(`db:peek hard timeout after ${hardTimeoutMs}ms`);
  process.exit(1);
}, hardTimeoutMs);

function printRows(title, rows) {
  console.log(`\n=== ${title} ===`);
  if (!rows || rows.length === 0) {
    console.log('(no rows)');
    return;
  }
  console.table(rows);
}

async function run() {
  try {
    await client.connect();

    const tables = await client.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name`
    );
    printRows('Public Tables', tables.rows);

    const slots = await client.query(
      `SELECT id, date, time, capacity, is_open
       FROM slots
       ORDER BY date, time
       LIMIT 5`
    );
    printRows('Slots (latest 5 by date/time order)', slots.rows);

    const bookings = await client.query(
      `SELECT id, first_name, last_name, phone_number, status, created_at
       FROM bookings
       ORDER BY created_at DESC
       LIMIT 5`
    );
    printRows('Bookings (latest 5)', bookings.rows);

    const config = await client.query(
      `SELECT name AS activity_name,
              default_duration_minutes AS slot_duration_minutes,
              max_party_size AS max_group_size,
              waitlist_enabled
       FROM activity_config
       LIMIT 5`
    );
    printRows('Activity Config', config.rows);

    console.log('\ndb:peek completed successfully.');
  } catch (error) {
    console.error('db:peek failed:', error.message);
    process.exitCode = 1;
  } finally {
    clearTimeout(hardTimeout);
    try {
      await client.end();
    } catch {
      // ignore close failures
    }
  }
}

run();
