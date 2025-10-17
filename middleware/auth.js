/**
 * Authentication Middleware
 * Verifies Supabase session and attaches user to request
 */

const supabase = require('../lib/supabase');
const prisma = require('../lib/prisma');

/**
 * Middleware to verify Supabase session from cookies/headers
 * Attaches user to req.user if authenticated
 */
async function authenticate(req, res, next) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Ensure user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    // Create user in database if they don't exist (edge case: user created in Supabase but not in our DB)
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email
        }
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if auth fails
  }
}

module.exports = {
  authenticate,
  optionalAuth
};
