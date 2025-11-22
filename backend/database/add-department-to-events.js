const mysql = require('mysql2/promise');
require('dotenv').config();

async function addDepartmentToEvents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'company_forum',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('Connected to database');

    const [columns] = await connection.query(
      `SHOW COLUMNS FROM events LIKE 'department_id'`
    );

    if (columns.length > 0) {
      console.log(' department_id column already exists in events table');
    } else {
      await connection.query(`
        ALTER TABLE events 
        ADD COLUMN department_id BIGINT NULL AFTER created_by,
        ADD CONSTRAINT fk_events_department 
          FOREIGN KEY (department_id) REFERENCES departments(id) 
          ON DELETE SET NULL,
        ADD INDEX idx_events_department (department_id)
      `);
      console.log(' Successfully added department_id column to events table');
    }

    const [structure] = await connection.query('DESCRIBE events');
    console.log('\nEvents table structure:');
    console.table(structure);

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('\nDatabase connection closed');
  }
}

addDepartmentToEvents()
  .then(() => {
    console.log('\n Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n Migration failed:', error.message);
    process.exit(1);
  });
