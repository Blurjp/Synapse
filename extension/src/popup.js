// Popup Script
const API_BASE_URL = 'https://synapse-production-68d7.up.railway.app';

document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    document.getElementById('pageTitle').textContent = 'No active tab';
    document.getElementById('pageUrl').textContent = '';
    return;
  }

  document.getElementById('pageTitle').textContent = tab.title || 'Unknown';
  document.getElementById('pageUrl').textContent = tab.url || '';

  // Check connection status
  checkConnection();

  // Check for selected text (only on http/https pages)
  if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    checkSelection();
  }

  // Load recent saves
  loadRecentSaves();

  // Event listeners
  document.getElementById('savePage').addEventListener('click', savePage);
  document.getElementById('saveSelection').addEventListener('click', saveSelection);
  document.getElementById('saveNote').addEventListener('click', saveNote);
  document.getElementById('openDashboard').addEventListener('click', openDashboard);
  document.getElementById('settings').addEventListener('click', openSettings);
});

// Check connection to backend
async function checkConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    if (data.status === 'healthy') {
      document.querySelector('.status').classList.remove('disconnected');
      document.querySelector('.status-text').textContent = 'Connected';
    }
  } catch (error) {
    document.querySelector('.status').classList.add('disconnected');
    document.querySelector('.status-text').textContent = 'Disconnected';
  }
}

// Check for selected text
async function checkSelection() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) return;

  try {
    chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not available:', chrome.runtime.lastError.message);
        return;
      }

      if (response && response.selection) {
        document.getElementById('selectionSection').style.display = 'block';
        document.getElementById('selectionPreview').textContent =
          response.selection.substring(0, 100) + (response.selection.length > 100 ? '...' : '');
      }
    });
  } catch (error) {
    console.log('Could not check selection:', error.message);
  }
}

// Save page to Synapse
async function savePage() {
  const btn = document.getElementById('savePage');
  btn.classList.add('loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
      showError('Cannot save this page. Only http/https pages are supported.');
      btn.classList.remove('loading');
      return;
    }

    // Get page content
    chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' }, async (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not available:', chrome.runtime.lastError.message);
        // Save basic info without content
        const data = {
          type: 'webpage',
          title: tab.title,
          content: '',
          raw_url: tab.url,
          metadata: {
            author: '',
            publishedAt: null,
            wordCount: 0
          }
        };

        const result = await sendToBackend('/api/sources/', data);

        if (result.success) {
          showSuccess('Page URL saved to Synapse!');
          loadRecentSaves();
        } else {
          showError('Failed to save page: ' + (result.error || 'Unknown error'));
        }
        btn.classList.remove('loading');
        return;
      }

      if (response) {
        const data = {
          type: 'webpage',
          title: tab.title,
          content: response.content || '',
          raw_url: tab.url,
          metadata: {
            author: response.author || '',
            publishedAt: response.publishedDate || null,
            wordCount: response.wordCount || 0
          }
        };

        const result = await sendToBackend('/api/sources/', data);

        if (result.success) {
          showSuccess('Page saved to Synapse!');
          loadRecentSaves();
        } else {
          showError('Failed to save page: ' + (result.error || 'Unknown error'));
        }
      }
      btn.classList.remove('loading');
    });
  } catch (error) {
    showError('Error saving page: ' + error.message);
    btn.classList.remove('loading');
  }
}

// Save selection as highlight
async function saveSelection() {
  const btn = document.getElementById('saveSelection');
  btn.classList.add('loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      showError('No active tab');
      btn.classList.remove('loading');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, async (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not available:', chrome.runtime.lastError.message);
        showError('Cannot get selection. Please refresh the page and try again.');
        btn.classList.remove('loading');
        return;
      }

      if (response && response.selection) {
        const data = {
          text: response.selection,
          source_url: tab.url,
          source_title: tab.title
        };

        const result = await sendToBackend('/api/highlights/', data);

        if (result.success) {
          showSuccess('Highlight saved!');
          document.getElementById('selectionSection').style.display = 'none';
        } else {
          showError('Failed to save highlight: ' + (result.error || 'Unknown error'));
        }
      }
      btn.classList.remove('loading');
    });
  } catch (error) {
    showError('Error saving highlight: ' + error.message);
    btn.classList.remove('loading');
  }
}

// Save quick note
async function saveNote() {
  const noteInput = document.getElementById('noteInput');
  const note = noteInput.value.trim();

  if (!note) {
    showError('Please enter a note');
    return;
  }

  const btn = document.getElementById('saveNote');
  btn.classList.add('loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const data = {
      content: note,
      source_url: tab?.url || '',
      source_title: tab?.title || ''
    };

    const result = await sendToBackend('/api/notes/', data);

    if (result.success) {
      showSuccess('Note saved!');
      noteInput.value = '';
      loadRecentSaves();
    } else {
      showError('Failed to save note: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    showError('Error saving note: ' + error.message);
  } finally {
    btn.classList.remove('loading');
  }
}

/**
 * Send data to the Synapse backend
 * @param {string} endpoint - API endpoint (e.g., '/api/sources/')
 * @param {Object} data - Data to send
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function sendToBackend(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return { success: true, data: await response.json() };
    } else {
      const errorBody = await response.text().catch(() => response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${errorBody}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Load recent saves
async function loadRecentSaves() {
  const recentList = document.getElementById('recentList');

  try {
    const response = await fetch(`${API_BASE_URL}/api/sources/?limit=5`);
    const data = await response.json();

    if (data.sources && data.sources.length > 0) {
      recentList.innerHTML = data.sources.map(source => `
        <div class="recent-item">
          <div class="recent-item-title">${escapeHtml(source.title)}</div>
          <div class="recent-item-meta">
            ${source.type} • ${formatDate(source.created_at)}
          </div>
        </div>
      `).join('');
    } else {
      recentList.innerHTML = '<div class="empty-state">No recent saves</div>';
    }
  } catch (error) {
    recentList.innerHTML = '<div class="empty-state">Failed to load</div>';
  }
}

// Open Synapse dashboard
function openDashboard(e) {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://frontend-psi-dun-58.vercel.app' });
}

// Open settings
function openSettings(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
}

// Show success message
function showSuccess(message) {
  console.log('Success:', message);
}

// Show error message
function showError(message) {
  console.error('Error:', message);
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}
