// Background Service Worker
const API_BASE_URL = 'https://synapse-production-68d7.up.railway.app';
const GOOGLE_CLIENT_ID = '906373584050-qj7pkabvuner8pj1ldqp67ef8jkq1ipt.apps.googleusercontent.com';

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SIGN_IN') {
    handleGoogleSignIn()
      .then(user => sendResponse({ success: true, user }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'SIGN_OUT') {
    chrome.storage.local.remove(['access_token', 'refresh_token', 'user'])
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handle Google Sign In
async function handleGoogleSignIn() {
  return new Promise((resolve, reject) => {
    const redirectUrl = chrome.identity.getRedirectURL();
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('redirect_uri', redirectUrl);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'select_account');

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true
      },
      async (redirectResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!redirectResponse) {
          reject(new Error('No response from OAuth'));
          return;
        }

        try {
          // Extract id_token from URL fragment
          const url = new URL(redirectResponse);
          const hash = url.hash.substring(1);
          const params = new URLSearchParams(hash);
          const idToken = params.get('id_token');

          if (!idToken) {
            reject(new Error('No ID token in response'));
            return;
          }

          // Exchange Google token for Synapse JWT
          const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_token: idToken })
          });

          if (!response.ok) {
            const error = await response.text();
            reject(new Error(`Auth failed: ${error}`));
            return;
          }

          const data = await response.json();

          // Store tokens and user info
          await chrome.storage.local.set({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user
          });

          resolve(data.user);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-synapse',
    title: 'Save to Synapse',
    contexts: ['page', 'selection']
  });
  
  chrome.contextMenus.create({
    id: 'save-highlight',
    title: 'Save Highlight to Synapse',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'save-link',
    title: 'Save Link to Synapse',
    contexts: ['link']
  });

  // New AI Summarize option
  chrome.contextMenus.create({
    id: 'summarize-page',
    title: '✨ AI Summarize Page',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-to-synapse') {
    if (info.selectionText) {
      // Save selection
      await saveHighlight(info.selectionText, tab.url, tab.title);
    } else {
      // Save entire page
      await savePage(tab);
    }
  } else if (info.menuItemId === 'save-highlight') {
    await saveHighlight(info.selectionText, tab.url, tab.title);
  } else if (info.menuItemId === 'save-link') {
    await saveLink(info.linkUrl, tab);
  } else if (info.menuItemId === 'summarize-page') {
    await summarizePage(tab);
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    showNotification('Error', 'No active tab');
    return;
  }

  if (command === 'save-page') {
    await savePage(tab);
  } else if (command === 'quick-note') {
    // Could open a quick note dialog
    console.log('Quick note shortcut pressed');
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_PAGE') {
    savePage(sender.tab);
    sendResponse({ success: true });
  } else if (request.type === 'SAVE_HIGHLIGHT') {
    saveHighlight(request.selection, sender.tab.url, sender.tab.title);
    sendResponse({ success: true });
  }
  return true;
});

// Save page to Synapse
async function savePage(tab) {
  try {
    // Get page content from content script
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' });
    
    if (response) {
      const data = {
        type: 'webpage',
        title: tab.title,
        content: response.content,
        raw_url: tab.url,
        metadata: {
          author: response.author || '',
          publishedAt: response.publishedDate || null,
          wordCount: response.wordCount || 0
        }
      };
      
      const result = await sendToBackend('/api/sources/', data);
      
      if (result.success) {
        showNotification('Page Saved', `"${tab.title}" saved to Synapse`);
      }
      
      return result;
    }
  } catch (error) {
    console.error('Error saving page:', error);
    showNotification('Error', 'Failed to save page to Synapse');
    return { success: false, error: error.message };
  }
}

// Save highlight to Synapse
async function saveHighlight(text, sourceUrl, sourceTitle) {
  try {
    const data = {
      text: text,
      source_url: sourceUrl,
      source_title: sourceTitle
    };
    
    const result = await sendToBackend('/api/highlights/', data);
    
    if (result.success) {
      showNotification('Highlight Saved', 'Highlight saved to Synapse');
    }
    
    return result;
  } catch (error) {
    console.error('Error saving highlight:', error);
    showNotification('Error', 'Failed to save highlight to Synapse');
    return { success: false, error: error.message };
  }
}

// Save link to Synapse
async function saveLink(linkUrl, tab) {
  try {
    const data = {
      type: 'link',
      title: linkUrl,
      raw_url: linkUrl,
      content: '',
      metadata: {
        savedFrom: tab.url
      }
    };
    
    const result = await sendToBackend('/api/sources', data);
    
    if (result.success) {
      showNotification('Link Saved', 'Link saved to Synapse');
    }
    
    return result;
  } catch (error) {
    console.error('Error saving link:', error);
    showNotification('Error', 'Failed to save link to Synapse');
    return { success: false, error: error.message };
  }
}

// AI Summarize page
async function summarizePage(tab) {
  try {
    showNotification('Summarizing...', 'Analyzing page content with AI');
    
    // Get page content from content script
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' });
    
    if (!response || !response.content) {
      showNotification('Error', 'Could not extract page content');
      return { success: false, error: 'No content' };
    }

    // Call AI summarize API
    const result = await sendToBackend('/api/ai/summarize', {
      content: response.content,
      title: tab.title,
      source_url: tab.url,
      max_length: 500,
      style: 'concise'
    });

    if (result.success && result.data) {
      const { summary, key_points } = result.data;
      
      // Create a notification with the summary
      const notificationMessage = summary.length > 100 
        ? summary.substring(0, 100) + '...' 
        : summary;
      
      showNotification('Summary Ready', notificationMessage);
      
      // Also save the summary to sources
      await sendToBackend('/api/sources/', {
        type: 'summary',
        title: `Summary: ${tab.title}`,
        content: summary,
        raw_url: tab.url,
        metadata: {
          key_points: key_points,
          original_word_count: response.wordCount,
          summarized_at: new Date().toISOString()
        }
      });

      return { success: true, data: result.data };
    } else {
      showNotification('Error', result.error || 'Failed to summarize page');
      return result;
    }
  } catch (error) {
    console.error('Error summarizing page:', error);
    showNotification('Error', 'Failed to summarize page: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send data to the Synapse backend with authentication
 * @param {string} endpoint - API endpoint (e.g., '/api/sources')
 * @param {Object} data - Data to send
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function sendToBackend(endpoint, data) {
  try {
    const result = await chrome.storage.local.get(['access_token']);
    const token = result.access_token;

    const headers = {
      'Content-Type': 'application/json'
    };

    // Add auth header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
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

// Show notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}
