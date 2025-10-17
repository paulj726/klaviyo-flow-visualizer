/**
 * Flows Routes
 * Handles flow data fetching and refreshing from Klaviyo
 */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { getUserApiKey } = require('./settings');

const HCTI_USER_ID = process.env.HCTI_USER_ID;
const HCTI_API_KEY = process.env.HCTI_API_KEY;

// Helper functions (from server.js)
async function fetchKlaviyoAPI(endpoint, apiKey) {
  const response = await fetch(`https://a.klaviyo.com/api${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': '2024-10-15',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Klaviyo API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchFlowActions(flowId, apiKey) {
  try {
    const data = await fetchKlaviyoAPI(`/flows/${flowId}/flow-actions`, apiKey);
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching actions for flow ${flowId}:`, error.message);
    return [];
  }
}

async function fetchFlowMessages(actionId, apiKey) {
  try {
    const data = await fetchKlaviyoAPI(`/flow-actions/${actionId}/flow-messages`, apiKey);
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching messages for action ${actionId}:`, error.message);
    return [];
  }
}

async function fetchEmailTemplate(messageId, apiKey) {
  try {
    const data = await fetchKlaviyoAPI(`/flow-messages/${messageId}/template`, apiKey);
    return data.data || null;
  } catch (error) {
    console.error(`Error fetching template for message ${messageId}:`, error.message);
    return null;
  }
}

async function generateScreenshot(html) {
  if (!HCTI_USER_ID || !HCTI_API_KEY) {
    return null;
  }

  try {
    const auth = Buffer.from(`${HCTI_USER_ID}:${HCTI_API_KEY}`).toString('base64');
    const response = await fetch('https://hcti.io/v1/image', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: html,
        viewport_width: 600,
        viewport_height: 800,
        device_scale: 2
      })
    });

    if (!response.ok) {
      throw new Error(`Screenshot API error: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error generating screenshot:', error.message);
    return null;
  }
}

function mapFlowType(flow) {
  const name = flow.attributes?.name?.toLowerCase() || '';
  if (name.includes('welcome')) return 'welcome';
  if (name.includes('abandon') || name.includes('cart')) return 'abandoned-cart';
  if (name.includes('browse') || name.includes('abandonment')) return 'browse-abandonment';
  if (name.includes('win') || name.includes('back')) return 'winback';
  if (name.includes('post')) return 'post-purchase';
  return 'custom';
}

/**
 * PUT /api/flows/:flowId/emails/:emailId/tags
 * Update tags for a specific email
 */
router.put('/:flowId/emails/:emailId/tags', authenticate, async (req, res) => {
  try {
    const { flowId, emailId } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    // Find the flow (verify ownership)
    const flow = await prisma.flow.findFirst({
      where: {
        flowId: flowId,
        userId: req.userId
      }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Update the email's tags
    await prisma.email.updateMany({
      where: {
        flowId: flow.id,
        emailId: emailId
      },
      data: {
        userTags: tags
      }
    });

    res.json({ message: 'Tags updated successfully', tags });

  } catch (error) {
    console.error('Error updating tags:', error);
    res.status(500).json({ error: 'Failed to update tags' });
  }
});

/**
 * GET /api/flows
 * Get all flows for the authenticated user from database
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Get flows from database for this user
    const flows = await prisma.flow.findMany({
      where: {
        userId: req.userId,
        archived: false
      },
      include: {
        emails: {
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform database format to frontend format
    const transformedFlows = flows.map(flow => ({
      id: flow.flowId,
      name: flow.name,
      status: flow.status,
      type: flow.type,
      klaviyoUrl: flow.klaviyoUrl,
      emails: flow.emails.map(email => ({
        id: email.emailId,
        name: email.name,
        delay: email.delay,
        messageType: email.messageType || 'email',
        messageBody: email.messageBody,
        screenshotUrl: email.screenshotUrl,
        tags: email.userTags, // JSON field
        metrics: {
          openRate: email.openRate,
          clickRate: email.clickRate,
          conversionRate: email.conversionRate
        }
      }))
    }));

    // Get user settings for last refresh time
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.userId },
      select: { lastRefresh: true }
    });

    res.json({
      flows: transformedFlows,
      metadata: {
        totalFlows: flows.length,
        liveFlows: flows.filter(f => f.status === 'live').length,
        flowsWithEmails: flows.filter(f => f.emails.length > 0).length,
        lastUpdated: settings?.lastRefresh?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('Error fetching flows from database:', error);
    res.status(500).json({
      error: 'Failed to fetch flows from database',
      message: error.message
    });
  }
});

/**
 * POST /api/flows/refresh
 * Fetch flows from Klaviyo and update database
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    // Get user's API key
    const apiKey = await getUserApiKey(req.userId);

    if (!apiKey) {
      return res.status(400).json({
        error: 'Klaviyo API key not configured. Please add your API key in Settings.'
      });
    }

    const generateScreenshots = true; // Always generate screenshots
    console.log(`[User ${req.userId}] Fetching flows from Klaviyo...`);

    // Fetch all flows from Klaviyo
    const flowsResponse = await fetchKlaviyoAPI('/flows', apiKey);
    const allFlows = flowsResponse.data || [];

    // Filter for live flows
    const liveFlows = allFlows.filter(flow => flow.attributes?.status === 'live');
    console.log(`[User ${req.userId}] Found ${liveFlows.length} live flows`);

    // Process each flow
    const processedFlows = [];

    for (let i = 0; i < liveFlows.length; i++) {
      const flow = liveFlows[i];

      if (i > 0) await delay(400); // Rate limiting

      const actions = await fetchFlowActions(flow.id, apiKey);

      // Process both email and SMS actions
      const messageActions = actions.filter(a =>
        a.attributes?.action_type === 'SEND_EMAIL' ||
        a.attributes?.action_type === 'send-sms'
      );

      // Process messages for this flow
      const processedEmails = [];

      for (let j = 0; j < messageActions.length; j++) {
        const action = messageActions[j];
        const actionType = action.attributes?.action_type;
        const isSMS = actionType === 'send-sms';

        if (j > 0) await delay(400);

        const messages = await fetchFlowMessages(action.id, apiKey);
        const firstMessage = messages[0];
        const messageName = firstMessage?.attributes?.name || `${isSMS ? 'SMS' : 'Email'} ${j + 1}`;
        const messageId = firstMessage?.id;

        // For SMS, extract message body from the first message
        let messageBody = null;
        if (isSMS && firstMessage?.attributes?.body) {
          messageBody = firstMessage.attributes.body;
        }

        // Generate screenshot only for emails
        let screenshotUrl = null;
        if (!isSMS && generateScreenshots && messageId && HCTI_USER_ID && HCTI_API_KEY) {
          await delay(400);
          const template = await fetchEmailTemplate(messageId, apiKey);
          if (template?.attributes?.html) {
            screenshotUrl = await generateScreenshot(template.attributes.html);
            if (screenshotUrl) {
              console.log(`  Generated screenshot for: ${messageName}`);
            }
          }
        }

        const messageDelay = action.attributes?.settings?.delay ||
          action.attributes?.settings?.time_delay ||
          'Immediately';

        processedEmails.push({
          emailId: action.id,
          name: messageName,
          delay: messageDelay,
          messageType: isSMS ? 'sms' : 'email',
          messageBody: messageBody,
          templateId: messageId,
          subjectLine: !isSMS ? (firstMessage?.attributes?.subject || null) : null,
          messageStatus: action.attributes?.status || null,
          screenshotUrl,
          position: j
        });
      }

      if (processedEmails.length > 0) {
        processedFlows.push({
          flowId: flow.id,
          name: flow.attributes?.name || 'Untitled Flow',
          status: flow.attributes?.status || 'unknown',
          type: mapFlowType(flow),
          klaviyoUrl: `https://www.klaviyo.com/flow/${flow.id}/edit`,
          triggerType: flow.attributes?.trigger_type || null,
          klaviyoCreatedAt: flow.attributes?.created ? new Date(flow.attributes.created) : null,
          klaviyoUpdatedAt: flow.attributes?.updated ? new Date(flow.attributes.updated) : null,
          rawData: flow,
          emails: processedEmails
        });
      }

      console.log(`[User ${req.userId}] Processed ${i + 1}/${liveFlows.length}: ${flow.attributes?.name}`);
    }

    // Save to database (upsert flows and emails)
    console.log(`[User ${req.userId}] Saving ${processedFlows.length} flows to database...`);

    for (const flowData of processedFlows) {
      const { emails, ...flowFields } = flowData;

      // Get existing flow to preserve user tags
      const existingFlow = await prisma.flow.findUnique({
        where: {
          userId_flowId: {
            userId: req.userId,
            flowId: flowData.flowId
          }
        },
        include: {
          emails: true
        }
      });

      // Upsert flow
      const flow = await prisma.flow.upsert({
        where: {
          userId_flowId: {
            userId: req.userId,
            flowId: flowData.flowId
          }
        },
        update: {
          ...flowFields,
          updatedAt: new Date()
        },
        create: {
          ...flowFields,
          userId: req.userId
        }
      });

      // Upsert emails (preserve user tags)
      for (const emailData of emails) {
        const existingEmail = existingFlow?.emails.find(e => e.emailId === emailData.emailId);
        const preservedTags = existingEmail?.userTags || [];

        await prisma.email.upsert({
          where: {
            flowId_emailId: {
              flowId: flow.id,
              emailId: emailData.emailId
            }
          },
          update: {
            ...emailData,
            userTags: preservedTags, // Preserve user tags
            screenshotGeneratedAt: emailData.screenshotUrl ? new Date() : existingEmail?.screenshotGeneratedAt,
            updatedAt: new Date()
          },
          create: {
            ...emailData,
            flowId: flow.id,
            userTags: preservedTags
          }
        });
      }
    }

    // Update last refresh timestamp
    await prisma.userSettings.update({
      where: { userId: req.userId },
      data: { lastRefresh: new Date() }
    });

    console.log(`[User ${req.userId}] ✓ Refresh complete!`);

    res.json({
      message: 'Flows refreshed successfully',
      flowsProcessed: processedFlows.length,
      totalFlows: allFlows.length,
      liveFlows: liveFlows.length
    });

  } catch (error) {
    console.error('[Refresh Error]', error);
    res.status(500).json({
      error: 'Failed to refresh flows from Klaviyo',
      message: error.message
    });
  }
});

module.exports = router;
