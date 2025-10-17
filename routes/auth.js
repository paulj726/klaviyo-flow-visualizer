/**
 * Authentication Routes
 * Handles user registration, login, and session management
 */

const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${req.protocol}://${req.get('host')}/`
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Create user in our database
    if (data.user) {
      try {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email
          }
        });
      } catch (dbError) {
        // User might already exist - that's ok
        console.log('User already exists in database:', data.user.email);
      }
    }

    res.json({
      user: data.user,
      session: data.session,
      message: data.session
        ? 'Registration successful'
        : 'Please check your email to confirm your account'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    if (token) {
      // Sign out from Supabase
      await supabase.auth.signOut(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /api/auth/session
 * Get current session info
 */
router.get('/session', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user,
      authenticated: true
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Failed to check session' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;
