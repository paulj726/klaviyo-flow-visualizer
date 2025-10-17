/**
 * Klaviyo Flow Visualizer - Frontend JavaScript
 * Multi-user version with authentication
 */

// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm';

// Initialize Supabase client (config injected by server)
const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Global state
let flowsData = { flows: [], metadata: {} };
let currentFilter = 'all';
let isLoading = false;
let currentUser = null;
let authToken = null;

// Initialize the app
async function init() {
  try {
    // Check authentication
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      // Not authenticated - redirect to login
      window.location.href = '/login.html';
      return;
    }

    // Set current user and token
    currentUser = session.user;
    authToken = session.access_token;

    // Display user info
    document.getElementById('userEmail').textContent = currentUser.email;

    // Load flows from database
    await fetchFlows();
    renderFlows();
    updateStats();
    setupFilterListeners();

  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize app. Please refresh the page.');
  }
}

// Fetch flows from database (not Klaviyo directly)
async function fetchFlows() {
  try {
    isLoading = true;
    showLoading();

    const response = await fetch('/api/flows', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - redirect to login
        window.location.href = '/login.html';
        return;
      }
      throw new Error(data.error || 'Failed to fetch flows');
    }

    flowsData = data;

    // Update last refresh timestamp
    if (data.metadata?.lastUpdated) {
      const date = new Date(data.metadata.lastUpdated);
      document.getElementById('lastUpdated').textContent = date.toLocaleString();
    } else {
      document.getElementById('lastUpdated').textContent = 'Never - Click "Refresh from Klaviyo"';
    }

    hideLoading();
    isLoading = false;
    return true;

  } catch (error) {
    console.error('Error fetching flows:', error);
    hideLoading();
    isLoading = false;
    showError(error.message);
    return false;
  }
}

// Refresh flows from Klaviyo (sync to database)
async function refreshFlows() {
  if (isLoading) return;

  // Check if user refreshed recently (within 60 minutes)
  if (flowsData.metadata?.lastUpdated) {
    const lastRefresh = new Date(flowsData.metadata.lastUpdated);
    const now = new Date();
    const minutesSinceRefresh = (now - lastRefresh) / (1000 * 60);

    if (minutesSinceRefresh < 60) {
      const minutesAgo = Math.floor(minutesSinceRefresh);
      const confirmed = confirm(
        `⚠️ You refreshed your data ${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago.\n\n` +
        `Are you sure you want to refresh again?\n\n` +
        `Note: Refreshing generates new screenshots for all emails, which can take several minutes.`
      );
      if (!confirmed) return;
    }
  }

  try {
    isLoading = true;

    // Show loading overlay
    showRefreshOverlay();

    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.innerHTML = '🔄 Refreshing...';

    const response = await fetch('/api/flows/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400 && data.error.includes('API key not configured')) {
        // Redirect to settings to configure API key
        hideRefreshOverlay();
        if (confirm('You need to configure your Klaviyo API key first. Go to Settings now?')) {
          window.location.href = '/settings.html';
        }
        return;
      }
      throw new Error(data.error || 'Failed to refresh flows');
    }

    showInfo(`✓ Successfully refreshed ${data.flowsProcessed} flows from Klaviyo`);

    // Reload flows from database
    await fetchFlows();
    renderFlows();
    updateStats();

  } catch (error) {
    console.error('Error refreshing flows:', error);
    showError(error.message);
  } finally {
    isLoading = false;
    hideRefreshOverlay();
    const btn = document.getElementById('refreshBtn');
    btn.disabled = false;
    btn.innerHTML = '🔄 Refresh from Klaviyo';
  }
}

// Handle logout
async function handleLogout() {
  try {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    showError('Failed to sign out. Please try again.');
  }
}

// Make handleLogout available globally
window.handleLogout = handleLogout;
window.refreshFlows = refreshFlows;

// Show loading state
function showLoading() {
  const container = document.getElementById('flowsContainer');
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; font-size: 18px; color: #667eea;">
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
        <div>Loading your flows...</div>
      </div>
    </div>
  `;
}

// Hide loading state
function hideLoading() {
  // Will be replaced by renderFlows()
}

// Show refresh overlay
function showRefreshOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'refreshOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  overlay.innerHTML = `
    <div style="background: white; padding: 3rem; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="font-size: 64px; margin-bottom: 1rem; animation: spin 2s linear infinite;">🔄</div>
      <h2 style="color: #2d3748; margin-bottom: 0.5rem;">Refreshing from Klaviyo</h2>
      <p style="color: #718096; margin-bottom: 0;">Fetching flows and generating email screenshots...</p>
      <p style="color: #a0aec0; font-size: 0.875rem; margin-top: 1rem;">This may take a few minutes</p>
    </div>
    <style>
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(overlay);
}

// Hide refresh overlay
function hideRefreshOverlay() {
  const overlay = document.getElementById('refreshOverlay');
  if (overlay) {
    overlay.remove();
  }
}

// Show error message
function showError(message) {
  const container = document.getElementById('flowsContainer');
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'background: #fed7d7; border: 2px solid #fc8181; padding: 16px; margin: 16px; border-radius: 8px; color: #c53030;';
  errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
  container.insertBefore(errorDiv, container.firstChild);
  setTimeout(() => errorDiv.remove(), 8000);
}

// Show info message
function showInfo(message) {
  const container = document.getElementById('flowsContainer');
  const infoDiv = document.createElement('div');
  infoDiv.style.cssText = 'background: #c6f6d5; border: 2px solid #68d391; padding: 16px; margin: 16px; border-radius: 8px; color: #22543d;';
  infoDiv.textContent = message;
  container.insertBefore(infoDiv, container.firstChild);
  setTimeout(() => infoDiv.remove(), 5000);
}

// Render all flows
function renderFlows() {
  const container = document.getElementById('flowsContainer');
  const filteredFlows = filterFlows(flowsData.flows);

  if (filteredFlows.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: #718096;">
        <div style="font-size: 48px; margin-bottom: 1rem;">📭</div>
        <h2 style="color: #2d3748; margin-bottom: 0.5rem;">No flows found</h2>
        <p style="margin-bottom: 1.5rem;">
          ${flowsData.flows.length === 0
            ? "Click 'Refresh from Klaviyo' to sync your flows"
            : "Try changing the filter to see more flows"}
        </p>
        ${flowsData.flows.length === 0 ? `
          <button class="btn btn-primary" onclick="refreshFlows()">
            🔄 Refresh from Klaviyo
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = filteredFlows.map(flow => `
    <div class="flow-row">
      <div class="flow-header">
        <div class="flow-title">
          <h2>${escapeHtml(flow.name)}</h2>
          <span class="flow-badge ${flow.status}">${flow.status}</span>
          <span class="flow-type">${flow.type}</span>
        </div>
        <div class="flow-actions">
          <a href="${flow.klaviyoUrl}" target="_blank" rel="noopener" class="btn btn-primary">
            Edit in Klaviyo →
          </a>
          <button class="btn btn-secondary" onclick="collapseFlow('${flow.id}')">
            Collapse
          </button>
        </div>
      </div>
      <div class="emails-container" id="flow-${flow.id}">
        ${renderEmails(flow.emails, flow.id)}
      </div>
    </div>
  `).join('');
}

// Render emails in a flow
function renderEmails(emails, flowId) {
  let html = '';
  emails.forEach((email, index) => {
    html += `
      <div class="email-card" data-email-id="${email.id}" data-flow-id="${flowId}">
        <div class="email-number">${index + 1}</div>
        <div class="email-preview" onclick="showPreview('${email.screenshotUrl || ''}', '${escapeHtml(email.name)}')">
          ${email.screenshotUrl
            ? `<img src="${email.screenshotUrl}" alt="${escapeHtml(email.name)}" style="width: 100%; height: 100%; object-fit: cover; object-position: top;">`
            : `<div class="email-placeholder">
                📧 Email Preview<br>
                <small>(No screenshot available)</small>
              </div>`
          }
        </div>
        <div class="email-info">
          <div class="email-name">${escapeHtml(email.name)}</div>
          <div class="email-delay">⏱️ ${email.delay}</div>
        </div>
        <div class="email-tags">
          ${email.tags.map(tag => `
            <span class="tag ${tag}" onclick="filterByTag('${tag}')" title="Click to filter">${tag}</span>
          `).join('')}
          <button class="add-tag" onclick="addTag('${flowId}', '${email.id}')">+ Add Tag</button>
        </div>
        <div class="email-metrics">
          <div class="metric">
            <div class="metric-value">${email.metrics.openRate.toFixed(1)}%</div>
            <div class="metric-label">Open</div>
          </div>
          <div class="metric">
            <div class="metric-value">${email.metrics.clickRate.toFixed(1)}%</div>
            <div class="metric-label">Click</div>
          </div>
          <div class="metric">
            <div class="metric-value">${email.metrics.conversionRate.toFixed(1)}%</div>
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
    emails: flow.emails.filter(email => email.tags && email.tags.includes(currentFilter))
  })).filter(flow => flow.emails.length > 0);
}

// Setup filter button listeners
function setupFilterListeners() {
  document.querySelectorAll('.filter-tag').forEach(button => {
    button.addEventListener('click', (e) => {
      filterByTag(e.target.dataset.tag);
    });
  });

  // Set "all" as default active
  document.querySelector('[data-tag="all"]').classList.add('active');
}

// Filter by specific tag
function filterByTag(tag) {
  // Remove active from all
  document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));

  // Add active to clicked or find matching
  const tagButton = document.querySelector(`[data-tag="${tag}"]`);
  if (tagButton) {
    tagButton.classList.add('active');
  }

  // Update filter
  currentFilter = tag;

  // Re-render
  renderFlows();
}

window.filterByTag = filterByTag;

// Update header stats
function updateStats() {
  document.getElementById('flowCount').textContent = flowsData.flows.length;
  const totalEmails = flowsData.flows.reduce((sum, flow) => sum + flow.emails.length, 0);
  document.getElementById('emailCount').textContent = totalEmails;
}

// Show preview modal
let currentZoom = 1;
function showPreview(screenshotUrl, emailName) {
  if (!screenshotUrl) {
    alert('Screenshot not available for this email.\n\nScreenshots are generated when you refresh flows from Klaviyo.');
    return;
  }

  currentZoom = 1; // Reset zoom
  const modal = document.getElementById('previewModal');
  const modalImage = document.getElementById('modalImage');
  modalImage.src = screenshotUrl;
  modalImage.alt = emailName;
  modalImage.style.transform = `scale(${currentZoom})`;
  updateZoomIndicator();
  modal.classList.add('active');
}

// Update zoom level indicator
function updateZoomIndicator() {
  const indicator = document.getElementById('zoomLevel');
  if (indicator) {
    indicator.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

window.showPreview = showPreview;

// Close preview modal
function closeModal() {
  document.getElementById('previewModal').classList.remove('active');
}

window.closeModal = closeModal;

// Zoom in modal image
function zoomIn() {
  const modalContent = document.querySelector('.modal-content');
  const scrollTop = modalContent.scrollTop;
  const scrollRatio = scrollTop / modalContent.scrollHeight;

  currentZoom = Math.min(currentZoom + 0.5, 4); // Max 4x zoom, larger increments
  const modalImage = document.getElementById('modalImage');
  modalImage.style.transform = `scale(${currentZoom})`;
  updateZoomIndicator();

  // Maintain scroll position relative to zoom
  setTimeout(() => {
    modalContent.scrollTop = modalContent.scrollHeight * scrollRatio;
  }, 50);
}

window.zoomIn = zoomIn;

// Zoom out modal image
function zoomOut() {
  const modalContent = document.querySelector('.modal-content');
  const scrollTop = modalContent.scrollTop;
  const scrollRatio = scrollTop / modalContent.scrollHeight;

  currentZoom = Math.max(currentZoom - 0.5, 0.75); // Min 0.75x zoom, larger increments
  const modalImage = document.getElementById('modalImage');
  modalImage.style.transform = `scale(${currentZoom})`;
  updateZoomIndicator();

  // Maintain scroll position relative to zoom
  setTimeout(() => {
    modalContent.scrollTop = modalContent.scrollHeight * scrollRatio;
  }, 50);
}

window.zoomOut = zoomOut;

// Reset zoom
function resetZoom() {
  currentZoom = 1;
  const modalImage = document.getElementById('modalImage');
  modalImage.style.transform = `scale(${currentZoom})`;
  updateZoomIndicator();
  const modalContent = document.querySelector('.modal-content');
  modalContent.scrollTop = 0; // Scroll back to top
}

window.resetZoom = resetZoom;

// Add tag to email (now updates database via API)
async function addTag(flowId, emailId) {
  const availableTags = ['discount', 'loyalty', 'social-proof', 'urgency', 'welcome', 'product-recs'];
  const tag = prompt('Enter tag name:\n\nSuggested tags:\n' + availableTags.join(', '));

  if (!tag) return;

  try {
    // Find the email in local state
    const flow = flowsData.flows.find(f => f.id === flowId);
    if (!flow) return;

    const email = flow.emails.find(e => e.id === emailId);
    if (!email) return;

    // Add tag locally
    if (!email.tags.includes(tag)) {
      email.tags.push(tag);
    }

    // Update in database
    const response = await fetch(`/api/flows/${flowId}/emails/${emailId}/tags`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ tags: email.tags })
    });

    if (!response.ok) {
      throw new Error('Failed to save tag');
    }

    // Re-render
    renderFlows();
    showInfo(`✓ Tag "${tag}" added`);

  } catch (error) {
    console.error('Error adding tag:', error);
    showError('Failed to add tag. Please try again.');
  }
}

window.addTag = addTag;

// Collapse/expand flow
function collapseFlow(flowId) {
  const container = document.getElementById(`flow-${flowId}`);
  if (container.style.display === 'none') {
    container.style.display = 'flex';
  } else {
    container.style.display = 'none';
  }
}

window.collapseFlow = collapseFlow;

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  init();
});
