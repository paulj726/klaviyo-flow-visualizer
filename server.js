require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Configure rate limiter: limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});
const PORT = process.env.PORT || 3000;
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const HCTI_USER_ID = process.env.HCTI_USER_ID;
const HCTI_API_KEY = process.env.HCTI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve the main page
app.get('/', limiter, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper function to fetch from Klaviyo API
async function fetchKlaviyoAPI(endpoint) {
    const response = await fetch(`https://a.klaviyo.com/api${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
            'revision': '2024-10-15',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Klaviyo API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Helper function to add delay for rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to fetch all flow actions (emails) for a flow
async function fetchFlowActions(flowId) {
    try {
        const data = await fetchKlaviyoAPI(`/flows/${flowId}/flow-actions`);
        return data.data || [];
    } catch (error) {
        console.error(`Error fetching actions for flow ${flowId}:`, error.message);
        return [];
    }
}

// Helper function to fetch flow messages for an action (to get email names)
async function fetchFlowMessages(actionId) {
    try {
        const data = await fetchKlaviyoAPI(`/flow-actions/${actionId}/flow-messages`);
        return data.data || [];
    } catch (error) {
        console.error(`Error fetching messages for action ${actionId}:`, error.message);
        return [];
    }
}

// Helper function to fetch email template HTML
async function fetchEmailTemplate(messageId) {
    try {
        const data = await fetchKlaviyoAPI(`/flow-messages/${messageId}/template`);
        return data.data || null;
    } catch (error) {
        console.error(`Error fetching template for message ${messageId}:`, error.message);
        return null;
    }
}

// Helper function to generate screenshot using HTML/CSS to Image API
async function generateScreenshot(html) {
    if (!HCTI_USER_ID || !HCTI_API_KEY) {
        console.log('HTML/CSS to Image API not configured, skipping screenshot generation');
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
                viewport_width: 600,  // Standard email width
                viewport_height: 800, // Reasonable height for preview
                device_scale: 2       // Retina quality
            })
        });

        if (!response.ok) {
            throw new Error(`Screenshot API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.url; // Returns the image URL
    } catch (error) {
        console.error(`Error generating screenshot:`, error.message);
        return null;
    }
}

// Helper function to map flow type from triggers
function mapFlowType(flow) {
    const name = flow.attributes?.name?.toLowerCase() || '';
    if (name.includes('welcome')) return 'welcome';
    if (name.includes('abandon') || name.includes('cart')) return 'abandoned-cart';
    if (name.includes('browse') || name.includes('abandonment')) return 'browse-abandonment';
    if (name.includes('win') || name.includes('back')) return 'winback';
    if (name.includes('post')) return 'post-purchase';
    return 'custom';
}

// API endpoint to get flows data from Klaviyo
app.get('/api/flows', async (req, res) => {
    try {
        // Check if API key is configured
        if (!KLAVIYO_API_KEY) {
            return res.status(500).json({
                error: 'Klaviyo API key not configured. Please set KLAVIYO_API_KEY in .env file'
            });
        }

        // Check if screenshots should be generated (optional query parameter)
        // Default to false in production (Vercel) to avoid timeouts
        const generateScreenshots = req.query.screenshots === 'true' || process.env.NODE_ENV !== 'production';
        const isProduction = process.env.VERCEL === '1'; // Vercel sets this environment variable

        // Fetch all flows from Klaviyo
        console.log('Fetching flows from Klaviyo...');
        const flowsResponse = await fetchKlaviyoAPI('/flows');
        const allFlows = flowsResponse.data || [];

        // Filter for live flows only and fetch their actions
        const liveFlows = allFlows.filter(flow => flow.attributes?.status === 'live');
        console.log(`Found ${liveFlows.length} live flows out of ${allFlows.length} total`);

        // Fetch flow actions (emails) for each live flow with rate limiting
        // Rate limit: 3 requests/second = ~400ms between requests (conservative)
        const flowsWithActions = [];
        for (let i = 0; i < liveFlows.length; i++) {
            const flow = liveFlows[i];

            // Add delay between requests (except for the first one)
            if (i > 0) {
                await delay(400); // Wait 400ms between requests to stay safely under 3/sec limit
            }

            const actions = await fetchFlowActions(flow.id);

            // Filter for email actions only
            // Note: action_type is "SEND_EMAIL", "SEND_SMS", etc.
            const emailActions = actions.filter(action =>
                action.attributes?.action_type === 'SEND_EMAIL'
            );

            // Fetch email names for each action with rate limiting
            const emailsWithNames = [];
            for (let j = 0; j < emailActions.length; j++) {
                const action = emailActions[j];

                // Add delay between message requests (except first one)
                if (j > 0) {
                    await delay(400);
                }

                // Fetch flow messages to get the email name
                const messages = await fetchFlowMessages(action.id);
                const firstMessage = messages[0];
                const emailName = firstMessage?.attributes?.name || `Email ${j + 1}`;
                const messageId = firstMessage?.id;

                // Fetch template HTML and generate screenshot (skip in production to avoid timeout)
                let screenshotUrl = null;
                if (!isProduction && messageId && HCTI_USER_ID && HCTI_API_KEY) {
                    // Add delay before fetching template
                    await delay(400);

                    const template = await fetchEmailTemplate(messageId);
                    if (template?.attributes?.html) {
                        // Generate screenshot from HTML
                        screenshotUrl = await generateScreenshot(template.attributes.html);
                        if (screenshotUrl) {
                            console.log(`  Generated screenshot for: ${emailName}`);
                        }
                    }
                }

                // Extract delay info from settings if available
                const emailDelay = action.attributes?.settings?.delay
                    || action.attributes?.settings?.time_delay
                    || 'Immediately';

                emailsWithNames.push({
                    id: action.id,
                    name: emailName,
                    delay: emailDelay,
                    screenshotUrl: screenshotUrl, // Add screenshot URL
                    tags: [], // User-managed tags - will be populated from localStorage in frontend
                    metrics: {
                        // These would come from reporting API in a more complete implementation
                        openRate: 0,
                        clickRate: 0,
                        conversionRate: 0
                    }
                });
            }

            flowsWithActions.push({
                id: flow.id,
                name: flow.attributes?.name || 'Untitled Flow',
                status: flow.attributes?.status || 'unknown',
                type: mapFlowType(flow),
                klaviyoUrl: `https://www.klaviyo.com/flow/${flow.id}/edit`,
                emails: emailsWithNames
            });

            console.log(`Processed flow ${i + 1}/${liveFlows.length}: ${flow.attributes?.name} (${emailsWithNames.length} emails)`);
        }

        // Filter out flows with no emails
        const flowsWithEmails = flowsWithActions.filter(flow => flow.emails.length > 0);

        res.json({
            flows: flowsWithEmails,
            metadata: {
                totalFlows: allFlows.length,
                liveFlows: liveFlows.length,
                flowsWithEmails: flowsWithEmails.length,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching flows:', error);
        res.status(500).json({
            error: 'Failed to fetch flows from Klaviyo',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Klaviyo Flow Visualizer is running!`);
    console.log(`\n📊 Open your browser to: http://localhost:${PORT}`);
    console.log(`\n✨ Features:`);
    console.log(`   - Horizontal flow visualization`);
    console.log(`   - Live flows only`);
    console.log(`   - Tag-based filtering`);
    console.log(`   - Click any email card to (eventually) see full preview`);
    console.log(`   - Add custom tags to emails`);
    console.log(`\n💡 Next steps to enhance:`);
    console.log(`   1. Connect to real Klaviyo API`);
    console.log(`   2. Generate actual email screenshots`);
    console.log(`   3. Add more filtering options`);
    console.log(`   4. Export/share functionality\n`);
});
