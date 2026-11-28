import bcrypt from 'bcrypt';
import db from './db.js';

/**
 * Creates a new user with the default "user" role.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email (used as the username).
 * @param {string} passwordHash - The bcrypt hash of the user's password.
 * @returns {number} The id of the newly created user record.
 */
const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4))
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, default_role];

    let result;
    try {
        result = await db.query(query, queryParams);
    } catch (error) {
        // The email column is UNIQUE: PostgreSQL error 23505 means it is already registered
        if (error.code === '23505') {
            const duplicateError = new Error('A user with that email already exists');
            duplicateError.isDuplicate = true;
            throw duplicateError;
        }

        throw error;
    }

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/**
 * Finds a user by email, including the name of their role.
 * @returns {Object|null} The user record (with password_hash), or null if not found.
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const queryParams = [email];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }

    return result.rows[0];
};

/**
 * Checks a plain text password against a stored bcrypt hash.
 * @returns {boolean} True if they match.
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Verifies an email and password.
 * @returns {Object|null} The user without password_hash, or null if the login is invalid.
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return null;
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);

    if (!passwordMatches) {
        return null;
    }

    // Never keep the password hash in the object that goes into the session
    delete user.password_hash;

    return user;
};

// Only the functions the controller needs are exported
/**
 * Retrieves all registered users together with the name of their role.
 * The password hash is never selected, so it cannot leak into a view.
 * @returns {Array} List of users: user_id, name, email, role_name.
 */
const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name, u.email
    `;

    const result = await db.query(query);

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Retrieved users:', result.rows.length);
    }

    return result.rows;
};

export { createUser, authenticateUser, getAllUsers };
