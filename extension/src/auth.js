// OAuth Authentication Module for Synapse Extension
const API_BASE_URL = 'https://synapse-production-68d7.up.railway.app';
const GOOGLE_CLIENT_ID = '906373584050-qj7pkabvuner8pj1ldqp67ef8jkq1ipt.apps.googleusercontent.com';

/**
 * Check if user is logged in
 */
async function isLoggedIn() {
  const result = await chrome.storage.local.get(['access_token', 'user']);
  return !!(result.access_token && result.user);
}

/**
 * Get current user info
 */
async function getCurrentUser() {
  const result = await chrome.storage.local.get(['user']);
  return result.user || null;
}

/**
 * Get access token
 */
async function getAccessToken() {
  const result = await chrome.storage.local.get(['access_token']);
  return result.access_token || null;
}

/**
 * Sign in with Google OAuth
 */
async function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    // Use chrome.identity API for OAuth
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

/**
 * Sign out
 */
async function signOut() {
  await chrome.storage.local.remove(['access_token', 'refresh_token', 'user']);
}

/**
 * Refresh access token
 */
async function refreshAccessToken() {
  const result = await chrome.storage.local.get(['refresh_token']);
  
  if (!result.refresh_token) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: result.refresh_token })
    });

    if (!response.ok) {
      // Refresh token invalid, sign out
      await signOut();
      throw new Error('Session expired');
    }

    const data = await response.json();

    await chrome.storage.local.set({
      access_token: data.access_token,
      refresh_token: data.refresh_token
    });

    return data.access_token;
  } catch (error) {
    await signOut();
    throw error;
  }
}

/**
 * Make authenticated API request
 */
async function authFetch(endpoint, options = {}) {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });
    } catch (error) {
      throw new Error('Authentication required');
    }
  }

  return response;
}

// Export functions for use in other extension scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isLoggedIn,
    getCurrentUser,
    getAccessToken,
    signInWithGoogle,
    signOut,
    authFetch
  };
}
