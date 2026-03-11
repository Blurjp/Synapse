// Content Script - Injected into all web pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SELECTION') {
    const selection = window.getSelection().toString().trim();
    sendResponse({ selection });
  } else if (request.type === 'GET_PAGE_CONTENT') {
    const content = extractPageContent();
    sendResponse(content);
  }
  return true;
});

// Extract page content
function extractPageContent() {
  // Get main content
  const article = document.querySelector('article') || 
                  document.querySelector('main') || 
                  document.querySelector('.content') ||
                  document.body;
  
  // Extract metadata
  const metadata = {
    title: document.title,
    description: getMetaContent('description'),
    author: getMetaContent('author'),
    publishedDate: getMetaContent('article:published_time'),
    wordCount: 0,
    content: ''
  };
  
  // Clone the article to avoid modifying the original
  const clone = article.cloneNode(true);
  
  // Remove unwanted elements
  const unwanted = clone.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .comments, .ads');
  unwanted.forEach(el => el.remove());
  
  // Get text content
  metadata.content = clone.innerText || clone.textContent;
  metadata.wordCount = metadata.content.split(/\s+/).length;
  
  return metadata;
}

// Get meta content
function getMetaContent(name) {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta ? meta.getAttribute('content') : '';
}

// Highlight selected text
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    // Could show a tooltip to save selection
    console.log('Text selected:', selection.toString());
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Shift + S: Save page
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'SAVE_PAGE' });
  }
  
  // Ctrl/Cmd + Shift + H: Save highlight
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
    e.preventDefault();
    const selection = window.getSelection().toString().trim();
    if (selection) {
      chrome.runtime.sendMessage({ type: 'SAVE_HIGHLIGHT', selection });
    }
  }
});
