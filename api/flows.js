// Helper function to fetch from Klaviyo API
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

// Helper function to add delay for rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to fetch all flow actions (emails) for a flow
async function fetchFlowActions(flowId, apiKey) {
    try {
        const data = await fetchKlaviyoAPI(`/flows/${flowId}/flow-actions`, apiKey);
        return data.data || [];
    } catch (error) {
        console.error(`Error fetching actions for flow ${flowId}:`, error.message);
        return [];
    }
}

// Helper function to fetch flow messages for an action (to get email names)
async function fetchFlowMessages(actionId, apiKey) {
    try {
        const data = await fetchKlaviyoAPI(`/flow-actions/${actionId}/flow-messages`, apiKey);
        return data.data || [];
    } catch (error) {
        console.error(`Error fetching messages for action ${actionId}:`, error.message);
        return [];
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

// Simple in-memory cache (Note: This resets on each cold start in serverless)
let cache = {
    data: null,
    timestamp: null
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Vercel Serverless Function Handler
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;

        // Check if API key is configured
        if (!KLAVIYO_API_KEY) {
            return res.status(500).json({
                error: 'Klaviyo API key not configured. Please set KLAVIYO_API_KEY in environment variables'
            });
        }

        // Check cache first
        const now = Date.now();
        const forceRefresh = req.query.refresh === 'true';

        if (!forceRefresh && cache.data && cache.timestamp && (now - cache.timestamp) < CACHE_DURATION) {
            console.log('Returning cached data');
            return res.status(200).json(cache.data);
        }

        // Fetch all flows from Klaviyo
        console.log('Fetching flows from Klaviyo...');
        const flowsResponse = await fetchKlaviyoAPI('/flows', KLAVIYO_API_KEY);
        const allFlows = flowsResponse.data || [];

        // Filter for live flows only and fetch their actions
        const liveFlows = allFlows.filter(flow => flow.attributes?.status === 'live');
        console.log(`Found ${liveFlows.length} live flows out of ${allFlows.length} total`);

        // Fetch flow actions (emails) for each live flow with rate limiting
        // Rate limit: Be very conservative to avoid 429 errors
        // Using 500ms delays to stay well under rate limits
        const flowsWithActions = [];
        for (let i = 0; i < liveFlows.length; i++) {
            const flow = liveFlows[i];

            // Add delay between requests (except for the first one)
            if (i > 0) {
                await delay(500); // Wait 500ms between requests to stay well under rate limits
            }

            const actions = await fetchFlowActions(flow.id, KLAVIYO_API_KEY);

            // Filter for email actions only
            const emailActions = actions.filter(action =>
                action.attributes?.action_type === 'SEND_EMAIL'
            );

            // Fetch email names for each action with rate limiting
            const emailsWithNames = [];
            for (let j = 0; j < emailActions.length; j++) {
                const action = emailActions[j];

                // Add delay between message requests (except first one)
                if (j > 0) {
                    await delay(500);
                }

                // Fetch flow messages to get the email name
                const messages = await fetchFlowMessages(action.id, KLAVIYO_API_KEY);
                const firstMessage = messages[0];
                const emailName = firstMessage?.attributes?.name || `Email ${j + 1}`;

                // Extract delay info from settings if available
                const emailDelay = action.attributes?.settings?.delay
                    || action.attributes?.settings?.time_delay
                    || 'Immediately';

                emailsWithNames.push({
                    id: action.id,
                    name: emailName,
                    delay: emailDelay,
                    screenshotUrl: null, // Screenshots disabled in production to avoid timeout
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

        const result = {
            flows: flowsWithEmails,
            metadata: {
                totalFlows: allFlows.length,
                liveFlows: liveFlows.length,
                flowsWithEmails: flowsWithEmails.length,
                lastUpdated: new Date().toISOString()
            }
        };

        // Update cache
        cache.data = result;
        cache.timestamp = Date.now();

        res.status(200).json(result);

    } catch (error) {
        console.error('Error fetching flows:', error);
        res.status(500).json({
            error: 'Failed to fetch flows from Klaviyo',
            message: error.message
        });
    }
}
