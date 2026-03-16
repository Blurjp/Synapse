// Shared API utilities for Synapse extension

/**
 * Get the API base URL from storage or return default
 * @returns {Promise<string>}
 */
export async function getApiBaseUrl() {
  const result = await chrome.storage.sync.get(['apiBaseUrl']);
  return result.apiBaseUrl || 'http://localhost:8001';
}

/**
 * Send data to the Synapse backend
 * @param {string} endpoint - API endpoint (e.g., '/api/sources')
 * @param {Object} data - Data to send
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function sendToBackend(endpoint, data) {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
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

/**
 * Fetch data from the Synapse backend
 * @param {string} endpoint - API endpoint (e.g., '/api/sources')
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function fetchFromBackend(endpoint) {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`);

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

/**
 * Check connection to backend
 * @returns {Promise<boolean>}
 */
export async function checkBackendConnection() {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}
