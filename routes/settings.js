/**
 * Settings Routes
 * Handles user settings and Klaviyo API key management
 */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { encrypt, decrypt } = require('../utils/encryption');
const { authenticate } = require('../middleware/auth');

/**
 * Helper function to test Klaviyo API key
 */
async function testKlaviyoApiKey(apiKey) {
  try {
    const response = await fetch('https://a.klaviyo.com/api/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
        'Accept': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Klaviyo API test error:', error);
    return false;
  }
}

/**
 * GET /api/settings
 * Get user settings (without exposing API key)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.userId },
      select: {
        lastRefresh: true
      }
    });

    res.json({
      hasApiKey: !!settings,
      lastRefresh: settings?.lastRefresh || null
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

/**
 * POST /api/settings
 * Save Klaviyo API key
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { klaviyoApiKey } = req.body;

    if (!klaviyoApiKey) {
      return res.status(400).json({ error: 'Klaviyo API key is required' });
    }

    // Validate API key format
    if (!klaviyoApiKey.startsWith('pk_')) {
      return res.status(400).json({
        error: 'Invalid API key format. Private keys should start with "pk_"'
      });
    }

    // Encrypt the API key
    const encryptedKey = encrypt(klaviyoApiKey);

    // Upsert user settings
    await prisma.userSettings.upsert({
      where: { userId: req.userId },
      update: {
        klaviyoApiKey: encryptedKey,
        updatedAt: new Date()
      },
      create: {
        userId: req.userId,
        klaviyoApiKey: encryptedKey
      }
    });

    res.json({ message: 'API key saved successfully' });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ error: 'Failed to save API key' });
  }
});

/**
 * POST /api/settings/test
 * Test Klaviyo API connection
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const { klaviyoApiKey } = req.body;

    if (!klaviyoApiKey) {
      return res.status(400).json({ error: 'Klaviyo API key is required' });
    }

    // Test the API key
    const isValid = await testKlaviyoApiKey(klaviyoApiKey);

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid API key or insufficient permissions. Please check your Klaviyo account.'
      });
    }

    res.json({ message: 'API key is valid' });
  } catch (error) {
    console.error('Test API key error:', error);
    res.status(500).json({ error: 'Failed to test API key' });
  }
});

/**
 * DELETE /api/settings
 * Delete API key
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    await prisma.userSettings.delete({
      where: { userId: req.userId }
    });

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      // Record not found
      return res.status(404).json({ error: 'No API key found' });
    }

    console.error('Delete settings error:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

/**
 * Helper function to get decrypted API key for a user
 * This is used internally by other routes
 */
async function getUserApiKey(userId) {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { klaviyoApiKey: true }
    });

    if (!settings) {
      return null;
    }

    return decrypt(settings.klaviyoApiKey);
  } catch (error) {
    console.error('Get user API key error:', error);
    return null;
  }
}

module.exports = router;
module.exports.getUserApiKey = getUserApiKey;
