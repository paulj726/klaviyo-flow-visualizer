const crypto = require('crypto');

/**
 * Encrypts text using AES-256-CBC encryption
 * @param {string} text - The text to encrypt
 * @returns {string} - Encrypted text in format "iv:encrypted" (hex)
 */
function encrypt(text) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Create a 32-byte key from the environment variable
  const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();

  // Generate a random 16-byte initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher with AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV and encrypted text separated by colon
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts text that was encrypted with the encrypt function
 * @param {string} text - Encrypted text in format "iv:encrypted" (hex)
 * @returns {string} - Decrypted text
 */
function decrypt(text) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Create a 32-byte key from the environment variable
  const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();

  // Split the IV and encrypted parts
  const parts = text.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format. Expected "iv:encrypted"');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  // Create decipher with AES-256-CBC
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  // Decrypt the text
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
