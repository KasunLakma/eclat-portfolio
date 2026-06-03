import crypto from 'crypto';

const SALT = process.env.AUTH_SALT || 'eclat-portfolio-salt-2026';

/**
 * Hashes a plain password using Node.js native crypto pbkdf2 algorithm.
 * @param {string} password - The plain-text password to hash.
 * @returns {string} The hex-encoded password hash.
 */
export function hashPassword(password) {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

/**
 * Verifies a plain password against a stored hashed password.
 * @param {string} password - The plain-text password.
 * @param {string} hashedPassword - The stored hashed password.
 * @returns {boolean} True if password matches the hash, false otherwise.
 */
export function verifyPassword(password, hashedPassword) {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}
