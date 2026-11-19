import { Pool } from 'pg';

/**
 * Connection pool for PostgreSQL database.
 *
 * A connection pool maintains a set of reusable database connections
 * to avoid the overhead of creating new connections for each request.
 * The connection string format is:
 * postgresql://username:password@host:port/database
 *
 * SSL is required by Render. For a local database (without SSL) set
 * DB_SSL=false in your .env file.
 */
const useSsl = process.env.DB_SSL !== 'false';

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false
});

// A single reference, so the export has the same name in development and production
let db = null;

if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
    /**
     * In development mode, wrap the pool to log every query to the console,
     * including how long it took and how many rows it returned.
     */
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${duration}ms`,
                    rows: res.rowCount
                });
                return res;
            } catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });
                throw error;
            }
        },
        async close() {
            await pool.end();
        }
    };
} else {
    // In production, export the pool directly without logging overhead
    db = pool;
}

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export { db as default, testConnection };
