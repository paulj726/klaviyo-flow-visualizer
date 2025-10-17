// Flow data - will be loaded from API
let flowsData = {
    flows: [],
    metadata: {}
};

// Sample data structure for reference - kept as fallback
const sampleFlowsData = {
    flows: [
        {
            id: "UCUHKm",
            name: "[Welcome] Welcome Series - Email",
            status: "live",
            type: "welcome",
            klaviyoUrl: "https://www.klaviyo.com/flow/UCUHKm/edit",
            emails: [
                {
                    id: "email_1",
                    name: "Welcome Email - Introduce Brand",
                    delay: "Immediately",
                    tags: ["welcome", "discount"],
                    metrics: { openRate: 45.2, clickRate: 12.3, conversionRate: 2.1 }
                },
                {
                    id: "email_2",
                    name: "Welcome Email 2 - Product Highlights",
                    delay: "2 days",
                    tags: ["welcome", "social-proof"],
                    metrics: { openRate: 38.5, clickRate: 10.1, conversionRate: 1.8 }
                },
                {
                    id: "email_3",
                    name: "Welcome Email 3 - Last Chance",
                    delay: "5 days",
                    tags: ["welcome", "urgency"],
                    metrics: { openRate: 32.1, clickRate: 8.5, conversionRate: 1.5 }
                }
            ]
        },
        {
            id: "U2DUPz",
            name: "[ACE] Abandoned Cart - Added to Cart",
            status: "live",
            type: "abandoned-cart",
            klaviyoUrl: "https://www.klaviyo.com/flow/U2DUPz/edit",
            emails: [
                {
                    id: "email_4",
                    name: "Cart Reminder 1",
                    delay: "4 hours",
                    tags: ["urgency", "discount"],
                    metrics: { openRate: 52.3, clickRate: 18.2, conversionRate: 5.2 }
                },
                {
                    id: "email_5",
                    name: "Cart Reminder 2 - Added Incentive",
                    delay: "1 day",
                    tags: ["urgency", "discount"],
                    metrics: { openRate: 44.1, clickRate: 15.3, conversionRate: 4.1 }
                }
            ]
        },
        {
            id: "WEmjMg",
            name: "[ACE] Abandoned Cart - Started Checkout",
            status: "live",
            type: "abandoned-checkout",
            klaviyoUrl: "https://www.klaviyo.com/flow/WEmjMg/edit",
            emails: [
                {
                    id: "email_6",
                    name: "Checkout Reminder",
                    delay: "1 hour",
                    tags: ["urgency"],
                    metrics: { openRate: 58.7, clickRate: 22.1, conversionRate: 8.3 }
                },
                {
                    id: "email_7",
                    name: "Last Chance to Complete",
                    delay: "12 hours",
                    tags: ["urgency", "social-proof"],
                    metrics: { openRate: 48.2, clickRate: 17.8, conversionRate: 6.1 }
                }
            ]
        },
        {
            id: "KPLmCq",
            name: "[Browse Recovery] Browse Abandonment",
            status: "live",
            type: "browse-abandonment",
            klaviyoUrl: "https://www.klaviyo.com/flow/KPLmCq/edit",
            emails: [
                {
                    id: "email_8",
                    name: "Come Back - Products You Viewed",
                    delay: "6 hours",
                    tags: [],
                    metrics: { openRate: 28.3, clickRate: 8.2, conversionRate: 1.2 }
                }
            ]
        },
        {
            id: "Xb6RYm",
            name: "[Post Purchase] 1x - First-Time & Repeat Last Purchase >1y",
            status: "live",
            type: "post-purchase",
            klaviyoUrl: "https://www.klaviyo.com/flow/Xb6RYm/edit",
            emails: [
                {
                    id: "email_9",
                    name: "Thank You + Join Loyalty",
                    delay: "1 day",
                    tags: ["loyalty"],
                    metrics: { openRate: 41.5, clickRate: 14.2, conversionRate: 3.8 }
                },
                {
                    id: "email_10",
                    name: "Product Care Tips",
                    delay: "7 days",
                    tags: [],
                    metrics: { openRate: 35.2, clickRate: 9.1, conversionRate: 1.5 }
                },
                {
                    id: "email_11",
                    name: "Complementary Products",
                    delay: "14 days",
                    tags: ["discount"],
                    metrics: { openRate: 32.8, clickRate: 10.5, conversionRate: 2.2 }
                }
            ]
        },
        {
            id: "YkJGZN",
            name: "5. Yotpo L&R - Redemption Created / Earned",
            status: "live",
            type: "loyalty",
            klaviyoUrl: "https://www.klaviyo.com/flow/YkJGZN/edit",
            emails: [
                {
                    id: "email_12",
                    name: "Congrats! Reward Earned",
                    delay: "Immediately",
                    tags: ["loyalty"],
                    metrics: { openRate: 62.1, clickRate: 28.3, conversionRate: 12.5 }
                }
            ]
        },
        {
            id: "SHkHib",
            name: "1. Yotpo L&R - Referral Share",
            status: "live",
            type: "loyalty",
            klaviyoUrl: "https://www.klaviyo.com/flow/SHkHib/edit",
            emails: [
                {
                    id: "email_13",
                    name: "Share & Earn Points",
                    delay: "Immediately",
                    tags: ["loyalty", "social-proof"],
                    metrics: { openRate: 48.5, clickRate: 15.2, conversionRate: 4.3 }
                }
            ]
        },
        {
            id: "SPZEm2",
            name: "[BACK IN STOCK]",
            status: "live",
            type: "back-in-stock",
            klaviyoUrl: "https://www.klaviyo.com/flow/SPZEm2/edit",
            emails: [
                {
                    id: "email_14",
                    name: "It's Back! Product Notification",
                    delay: "Immediately",
                    tags: ["urgency"],
                    metrics: { openRate: 71.2, clickRate: 32.5, conversionRate: 15.8 }
                }
            ]
        }
    ]
};

let currentFilter = 'all';
let isLoading = false;

// Fetch flows from API
async function fetchFlows() {
    try {
        isLoading = true;
        showLoading();

        const response = await fetch('/api/flows');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch flows');
        }

        // Merge with localStorage data to preserve user-added tags
        const savedData = loadSavedData();
        if (savedData && savedData.flows) {
            // Merge tags from saved data with new API data
            data.flows.forEach(apiFlow => {
                const savedFlow = savedData.flows.find(f => f.id === apiFlow.id);
                if (savedFlow) {
                    apiFlow.emails.forEach(apiEmail => {
                        const savedEmail = savedFlow.emails.find(e => e.id === apiEmail.id);
                        if (savedEmail && savedEmail.tags) {
                            apiEmail.tags = savedEmail.tags;
                        }
                    });
                }
            });
        }

        flowsData = data;
        hideLoading();
        isLoading = false;
        return true;
    } catch (error) {
        console.error('Error fetching flows:', error);
        hideLoading();
        isLoading = false;

        // Show error message
        showError(error.message);

        // Try to use sample data as fallback
        const savedData = loadSavedData();
        if (savedData && savedData.flows && savedData.flows.length > 0) {
            flowsData = savedData;
            showInfo('Using cached data. API connection failed.');
            return true;
        } else {
            // Use sample data if no saved data
            flowsData = sampleFlowsData;
            showInfo('Using sample data. Please configure KLAVIYO_API_KEY in .env file.');
            return false;
        }
    }
}

// Show loading state
function showLoading() {
    const container = document.getElementById('flowsContainer');
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; font-size: 18px; color: #667eea;">
            <div>
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div>Loading flows from Klaviyo...</div>
            </div>
        </div>
    `;
}

// Hide loading state
function hideLoading() {
    // Loading will be replaced by renderFlows()
}

// Show error message
function showError(message) {
    const container = document.getElementById('flowsContainer');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'background: #fee; border: 2px solid #fcc; padding: 16px; margin: 16px; border-radius: 8px; color: #c00;';
    errorDiv.textContent = `Error: ${message}`;
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show info message
function showInfo(message) {
    const container = document.getElementById('flowsContainer');
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'background: #fef3cd; border: 2px solid #ffc107; padding: 16px; margin: 16px; border-radius: 8px; color: #856404;';
    infoDiv.textContent = message;
    container.insertBefore(infoDiv, container.firstChild);
    setTimeout(() => infoDiv.remove(), 5000);
}

// Initialize the app
async function init() {
    await fetchFlows();
    renderFlows();
    updateStats();
    setupFilterListeners();
    updateLastRefreshed();
}

// Update last refreshed timestamp
function updateLastRefreshed() {
    const timestamp = flowsData.metadata?.lastUpdated || new Date().toISOString();
    const date = new Date(timestamp);
    const formatted = date.toLocaleString();
    document.getElementById('lastUpdated').textContent = formatted;
}

// Render all flows
function renderFlows() {
    const container = document.getElementById('flowsContainer');
    const filteredFlows = filterFlows(flowsData.flows);
    
    container.innerHTML = filteredFlows.map(flow => `
        <div class="flow-row">
            <div class="flow-header">
                <div class="flow-title">
                    <h2>${flow.name}</h2>
                    <span class="flow-badge ${flow.status}">${flow.status}</span>
                    <span class="flow-type">${flow.type}</span>
                </div>
                <div class="flow-actions">
                    <a href="${flow.klaviyoUrl}" target="_blank" class="btn btn-primary">
                        Edit in Klaviyo →
                    </a>
                    <button class="btn btn-secondary" onclick="collapseFlow('${flow.id}')">
                        Collapse
                    </button>
                </div>
            </div>
            <div class="emails-container" id="flow-${flow.id}">
                ${renderEmails(flow.emails)}
            </div>
        </div>
    `).join('');
}

// Render emails in a flow
function renderEmails(emails) {
    let html = '';
    emails.forEach((email, index) => {
        html += `
            <div class="email-card" data-email-id="${email.id}" data-tags="${email.tags.join(',')}">
                <div class="email-number">${index + 1}</div>
                <div class="email-preview" onclick="showPreview('${email.id}', '${email.screenshotUrl || ''}')">
                    ${email.screenshotUrl ?
                        `<img src="${email.screenshotUrl}" alt="${email.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        `<div class="email-placeholder">
                            📧 Click to view preview<br>
                            <small>(Generating screenshot...)</small>
                        </div>`
                    }
                </div>
                <div class="email-info">
                    <div class="email-name">${email.name}</div>
                    <div class="email-delay">⏱️ ${email.delay}</div>
                </div>
                <div class="email-tags">
                    ${email.tags.map(tag => `<span class="tag ${tag}">${tag}</span>`).join('')}
                    <button class="add-tag" onclick="addTag('${email.id}')">+ Add Tag</button>
                </div>
                <div class="email-metrics">
                    <div class="metric">
                        <div class="metric-value">${email.metrics.openRate}%</div>
                        <div class="metric-label">Open</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${email.metrics.clickRate}%</div>
                        <div class="metric-label">Click</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${email.metrics.conversionRate}%</div>
                        <div class="metric-label">Conv</div>
                    </div>
                </div>
            </div>
        `;
        
        if (index < emails.length - 1) {
            html += '<div class="arrow-connector">→</div>';
        }
    });
    return html;
}

// Filter flows based on active tag filter
function filterFlows(flows) {
    if (currentFilter === 'all') {
        return flows;
    }
    
    return flows.map(flow => ({
        ...flow,
        emails: flow.emails.filter(email => email.tags.includes(currentFilter))
    })).filter(flow => flow.emails.length > 0);
}

// Setup filter button listeners
function setupFilterListeners() {
    document.querySelectorAll('.filter-tag').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active from all
            document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
            
            // Add active to clicked
            e.target.classList.add('active');
            
            // Update filter
            currentFilter = e.target.dataset.tag;
            
            // Re-render
            renderFlows();
        });
    });
    
    // Set "all" as default active
    document.querySelector('[data-tag="all"]').classList.add('active');
}

// Update header stats
function updateStats() {
    document.getElementById('flowCount').textContent = flowsData.flows.length;
    const totalEmails = flowsData.flows.reduce((sum, flow) => sum + flow.emails.length, 0);
    document.getElementById('emailCount').textContent = totalEmails;
}

// Show preview modal
function showPreview(emailId, screenshotUrl) {
    if (!screenshotUrl) {
        alert('Screenshot not yet generated for this email.\n\nTo enable screenshots:\n1. Sign up at https://htmlcsstoimage.com\n2. Add your credentials to the .env file\n3. Refresh the flows data');
        return;
    }

    const modal = document.getElementById('previewModal');
    const modalImage = document.getElementById('modalImage');
    modalImage.src = screenshotUrl;
    modal.classList.add('active');
}

// Close preview modal
function closeModal() {
    document.getElementById('previewModal').classList.remove('active');
}

// Add tag to email
function addTag(emailId) {
    const availableTags = ['discount', 'loyalty', 'social-proof', 'urgency', 'welcome', 'product-recs'];
    const tag = prompt('Enter tag name:\n\nAvailable tags:\n' + availableTags.join(', '));
    
    if (tag) {
        // Find email and add tag
        flowsData.flows.forEach(flow => {
            const email = flow.emails.find(e => e.id === emailId);
            if (email && !email.tags.includes(tag)) {
                email.tags.push(tag);
            }
        });
        
        // Re-render
        renderFlows();
        
        // Save to localStorage
        saveData();
    }
}

// Collapse/expand flow
function collapseFlow(flowId) {
    const container = document.getElementById(`flow-${flowId}`);
    if (container.style.display === 'none') {
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('klaviyoFlowsData', JSON.stringify(flowsData));
}

// Load data from localStorage (for tag persistence)
function loadSavedData() {
    const saved = localStorage.getItem('klaviyoFlowsData');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing saved data:', e);
            return null;
        }
    }
    return null;
}

// Add refresh button functionality
function refreshFlows() {
    if (!isLoading) {
        init();
    }
}

// Export to Google Sheets
async function exportToSheets() {
    if (isLoading) {
        alert('Please wait for flows to finish loading before exporting.');
        return;
    }

    const confirmed = confirm('This will create a new Google Sheet with all your flows and email screenshots. This may take 1-2 minutes. Continue?');
    if (!confirmed) return;

    try {
        // Show loading message
        const originalButton = event.target;
        const originalText = originalButton.textContent;
        originalButton.textContent = '⏳ Exporting...';
        originalButton.disabled = true;

        const response = await fetch('/api/export-to-sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to export to Google Sheets');
        }

        // Success! Open the sheet
        alert(`Success! Your Google Sheet has been created.\n\nOpening in a new tab...`);
        window.open(data.spreadsheetUrl, '_blank');

        // Reset button
        originalButton.textContent = originalText;
        originalButton.disabled = false;

    } catch (error) {
        console.error('Error exporting to Google Sheets:', error);
        alert(`Error: ${error.message}\n\nPlease make sure Google Sheets API is configured correctly.`);

        // Reset button
        event.target.textContent = '📊 Export to Google Sheets';
        event.target.disabled = false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    init();
});
