/**
 * Auth Helper Functions
 * Shared utilities for authentication across all frontend pages
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm';

// Initialize Supabase client
// These will be injected by the server into window object
const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Auth will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if user is authenticated
 * @returns {Promise<{session: object|null, user: object|null}>}
 */
export async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Auth check error:', error);
      return { session: null, user: null };
    }

    return {
      session,
      user: session?.user || null
    };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { session: null, user: null };
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 * @param {string} redirectTo - URL to redirect to after login (optional)
 * @returns {Promise<{session: object, user: object}>}
 */
export async function requireAuth(redirectTo = null) {
  const { session, user } = await checkAuth();

  if (!session || !user) {
    const loginUrl = redirectTo
      ? `/login.html?redirect=${encodeURIComponent(redirectTo)}`
      : '/login.html';

    window.location.href = loginUrl;
    throw new Error('Authentication required');
  }

  return { session, user };
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data: object, error: object|null}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}

/**
 * Sign up with email and password
 * @param {string} email
 * @param {string} password
 * @param {object} options - Additional options like emailRedirectTo
 * @returns {Promise<{data: object, error: object|null}>}
 */
export async function signUp(email, password, options = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        ...options
      }
    });

    return { data, error };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
}

/**
 * Sign out current user
 * @returns {Promise<{error: object|null}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

/**
 * Get current user
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  const { user } = await checkAuth();
  return user;
}

/**
 * Listen to auth state changes
 * @param {function} callback - Called with (event, session) on auth change
 * @returns {object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(url, options = {}) {
  const { session } = await checkAuth();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Send session cookie
  });
}

/**
 * Handle authentication errors
 * @param {object} error - Error object from Supabase
 * @returns {string} User-friendly error message
 */
export function getAuthErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  const errorMessages = {
    'Invalid login credentials': 'Invalid email or password.',
    'User already registered': 'An account with this email already exists.',
    'Email not confirmed': 'Please confirm your email address before signing in.',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
    'Unable to validate email address: invalid format': 'Please enter a valid email address.',
    'Signups not allowed for this instance': 'New signups are currently disabled.',
    'Email rate limit exceeded': 'Too many attempts. Please try again later.',
    'Anonymous sign-ins are disabled': 'Anonymous access is not allowed.'
  };

  return errorMessages[error.message] || error.message || 'An error occurred. Please try again.';
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} {isValid: boolean, errors: string[]}
 */
export function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get redirect URL from query parameters
 * @returns {string|null}
 */
export function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect');
}

/**
 * Redirect after successful authentication
 * @param {string} defaultUrl - Default URL if no redirect specified
 */
export function redirectAfterAuth(defaultUrl = '/') {
  const redirectUrl = getRedirectUrl();
  window.location.href = redirectUrl || defaultUrl;
}
