import { google } from 'googleapis';

// Helper to authenticate with Google Sheets API
function getGoogleSheetsClient() {
    // Parse the service account credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
}

// Helper to fetch flows data from the API
async function fetchFlowsData(klaviyoApiKey, includeScreenshots = true) {
    const fetchKlaviyoAPI = async (endpoint) => {
        const response = await fetch(`https://a.klaviyo.com/api${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
                'revision': '2024-10-15',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Klaviyo API error: ${response.status}`);
        }

        return response.json();
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Fetch flows
    const flowsResponse = await fetchKlaviyoAPI('/flows');
    const allFlows = flowsResponse.data || [];
    const liveFlows = allFlows.filter(flow => flow.attributes?.status === 'live');

    const flowsWithActions = [];

    for (let i = 0; i < liveFlows.length; i++) {
        const flow = liveFlows[i];
        if (i > 0) await delay(500);

        const actionsData = await fetchKlaviyoAPI(`/flows/${flow.id}/flow-actions`);
        const actions = actionsData.data || [];
        const emailActions = actions.filter(action => action.attributes?.action_type === 'SEND_EMAIL');

        const emails = [];
        for (let j = 0; j < emailActions.length; j++) {
            const action = emailActions[j];
            if (j > 0) await delay(500);

            const messagesData = await fetchKlaviyoAPI(`/flow-actions/${action.id}/flow-messages`);
            const messages = messagesData.data || [];
            const firstMessage = messages[0];

            let screenshotUrl = null;
            if (includeScreenshots && firstMessage?.id) {
                await delay(500);
                const templateData = await fetchKlaviyoAPI(`/flow-messages/${firstMessage.id}/template`);

                if (templateData?.data?.attributes?.html && process.env.HCTI_USER_ID && process.env.HCTI_API_KEY) {
                    // Generate screenshot
                    const auth = Buffer.from(`${process.env.HCTI_USER_ID}:${process.env.HCTI_API_KEY}`).toString('base64');
                    const screenshotResponse = await fetch('https://hcti.io/v1/image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            html: templateData.data.attributes.html,
                            viewport_width: 600,
                            viewport_height: 800,
                            device_scale: 2
                        })
                    });

                    if (screenshotResponse.ok) {
                        const screenshotData = await screenshotResponse.json();
                        screenshotUrl = screenshotData.url;
                    }
                }
            }

            emails.push({
                id: action.id,
                name: firstMessage?.attributes?.name || `Email ${j + 1}`,
                delay: action.attributes?.settings?.delay || 'Immediately',
                screenshotUrl,
                tags: [],
                metrics: { openRate: 0, clickRate: 0, conversionRate: 0 }
            });
        }

        if (emails.length > 0) {
            flowsWithActions.push({
                id: flow.id,
                name: flow.attributes?.name || 'Untitled Flow',
                status: flow.attributes?.status || 'live',
                klaviyoUrl: `https://www.klaviyo.com/flow/${flow.id}/edit`,
                emails
            });
        }
    }

    return flowsWithActions;
}

// Create or update a Google Sheet with flow data
async function createOrUpdateSheet(flows, spreadsheetId = null) {
    const sheets = await getGoogleSheetsClient();

    let sheetId = spreadsheetId;

    // Create new spreadsheet if no ID provided
    if (!sheetId) {
        const createResponse = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: `Klaviyo Flows - ${new Date().toLocaleDateString()}`,
                },
                sheets: [{
                    properties: {
                        title: 'Flow Overview',
                        gridProperties: {
                            frozenRowCount: 1,
                        }
                    }
                }]
            }
        });
        sheetId = createResponse.data.spreadsheetId;
    }

    // Prepare data for the sheet
    const rows = [
        // Header row
        ['Flow Name', 'Status', 'Email #', 'Email Name', 'Delay', 'Screenshot', 'Open Rate', 'Click Rate', 'Conv Rate', 'Klaviyo Link']
    ];

    // Add data rows
    flows.forEach(flow => {
        flow.emails.forEach((email, index) => {
            rows.push([
                flow.name,
                flow.status,
                index + 1,
                email.name,
                email.delay,
                email.screenshotUrl || 'N/A',
                `${email.metrics.openRate}%`,
                `${email.metrics.clickRate}%`,
                `${email.metrics.conversionRate}%`,
                flow.klaviyoUrl
            ]);
        });
    });

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: 'Flow Overview!A:Z',
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Flow Overview!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: rows,
        },
    });

    // Format the sheet
    const requests = [
        // Bold header row
        {
            repeatCell: {
                range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                },
                cell: {
                    userEnteredFormat: {
                        textFormat: { bold: true },
                        backgroundColor: { red: 0.4, green: 0.5, blue: 0.9 },
                        horizontalAlignment: 'CENTER',
                    }
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)',
            }
        },
        // Auto-resize columns
        {
            autoResizeDimensions: {
                dimensions: {
                    sheetId: 0,
                    dimension: 'COLUMNS',
                    startIndex: 0,
                    endIndex: 10,
                }
            }
        },
        // Set row height for screenshot column
        {
            updateDimensionProperties: {
                range: {
                    sheetId: 0,
                    dimension: 'ROWS',
                    startIndex: 1,
                    endIndex: rows.length,
                },
                properties: {
                    pixelSize: 100,
                },
                fields: 'pixelSize',
            }
        }
    ];

    // Add images to screenshot column
    const imageRequests = [];
    let rowIndex = 1; // Start after header
    flows.forEach(flow => {
        flow.emails.forEach(email => {
            if (email.screenshotUrl) {
                imageRequests.push({
                    updateCells: {
                        range: {
                            sheetId: 0,
                            startRowIndex: rowIndex,
                            endRowIndex: rowIndex + 1,
                            startColumnIndex: 5, // Screenshot column (F)
                            endColumnIndex: 6,
                        },
                        rows: [{
                            values: [{
                                userEnteredValue: {
                                    formulaValue: `=IMAGE("${email.screenshotUrl}", 4, 80, 80)`
                                }
                            }]
                        }],
                        fields: 'userEnteredValue',
                    }
                });
            }
            rowIndex++;
        });
    });

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
            requests: [...requests, ...imageRequests],
        },
    });

    // Make the spreadsheet publicly readable
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
            requests: [{
                addSheet: {
                    properties: {
                        title: 'Instructions',
                    }
                }
            }]
        },
    }).catch(() => {}); // Ignore if sheet already exists

    // Add instructions
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Instructions!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [
                ['Klaviyo Flow Visualizer - Google Sheets Export'],
                [''],
                ['This spreadsheet contains your Klaviyo email flows with screenshots.'],
                [''],
                ['Columns:'],
                ['- Flow Name: The name of the Klaviyo flow'],
                ['- Status: Whether the flow is live or draft'],
                ['- Email #: The sequence number of the email in the flow'],
                ['- Email Name: The name of the email'],
                ['- Delay: Time delay before the email is sent'],
                ['- Screenshot: Visual preview of the email'],
                ['- Open/Click/Conv Rate: Performance metrics'],
                ['- Klaviyo Link: Direct link to edit the flow in Klaviyo'],
                [''],
                [`Last Updated: ${new Date().toLocaleString()}`],
            ],
        },
    });

    return sheetId;
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
        const GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

        if (!KLAVIYO_API_KEY) {
            return res.status(500).json({ error: 'Klaviyo API key not configured' });
        }

        if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
            return res.status(500).json({ error: 'Google service account not configured' });
        }

        console.log('Fetching flows data...');
        const flows = await fetchFlowsData(KLAVIYO_API_KEY, true);

        console.log('Creating Google Sheet...');
        const spreadsheetId = await createOrUpdateSheet(flows);

        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

        res.status(200).json({
            success: true,
            spreadsheetId,
            spreadsheetUrl,
            message: 'Google Sheet created successfully',
        });

    } catch (error) {
        console.error('Error exporting to Google Sheets:', error);
        res.status(500).json({
            error: 'Failed to export to Google Sheets',
            message: error.message,
        });
    }
}
