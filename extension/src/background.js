// Background Service Worker
const API_BASE_URL = 'http://localhost:8001';

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
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
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
      
      const result = await sendToBackend('/api/sources', data);
      
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
    
    const result = await sendToBackend('/api/highlights', data);
    
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

// Send data to backend
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
      return { success: false, error: response.statusText };
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
