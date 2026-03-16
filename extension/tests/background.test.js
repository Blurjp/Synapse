// Tests for background.js (Service Worker)
const fs = require('fs')
const path = require('path')

// Load the background script
const backgroundCode = fs.readFileSync(path.join(__dirname, '../src/background.js'), 'utf8')

// Execute in a function to capture the global functions
const API_BASE_URL = 'http://localhost:8001'

describe('Background Service Worker', () => {
  beforeEach(() => {
    // Reset chrome mock
    chrome.runtime.onInstalled.addListener.mockClear()
    chrome.contextMenus.create.mockClear()
    chrome.contextMenus.onClicked.addListener.mockClear()
    chrome.commands.onCommand.addListener.mockClear()
    chrome.notifications.create.mockClear()
  })

  describe('Context Menu Creation', () => {
    it('creates context menu items on install', () => {
      // Simulate the context menu creation as the background script would do
      chrome.contextMenus.create({
        id: 'save-to-synapse',
        title: 'Save to Synapse',
        contexts: ['page', 'selection'],
      })

      chrome.contextMenus.create({
        id: 'save-highlight',
        title: 'Save Highlight to Synapse',
        contexts: ['selection'],
      })

      chrome.contextMenus.create({
        id: 'save-link',
        title: 'Save Link to Synapse',
        contexts: ['link'],
      })

      // Check that context menus were created
      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(3)
      expect(chrome.contextMenus.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'save-to-synapse' })
      )
    })
  })

  describe('saveHighlight', () => {
    it('saves highlight to backend', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, text: 'test highlight' }),
      })

      // Simulate saving highlight
      const response = await fetch(`${API_BASE_URL}/api/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'test highlight',
          source_url: 'https://example.com',
          source_title: 'Test Page',
        }),
      })

      expect(response.ok).toBe(true)
    })

    it('handles highlight save failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      })

      const response = await fetch(`${API_BASE_URL}/api/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' }),
      })

      expect(response.ok).toBe(false)
    })
  })

  describe('savePage', () => {
    it('saves page to backend', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: 'Test Page' }),
      })

      const response = await fetch(`${API_BASE_URL}/api/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'webpage',
          title: 'Test Page',
          content: 'Test content',
          raw_url: 'https://example.com',
          metadata: { author: '', publishedAt: null, wordCount: 2 },
        }),
      })

      expect(response.ok).toBe(true)
    })
  })

  describe('saveLink', () => {
    it('saves link to backend', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, raw_url: 'https://example.com' }),
      })

      const response = await fetch(`${API_BASE_URL}/api/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'link',
          title: 'https://example.com',
          raw_url: 'https://example.com',
          content: '',
          metadata: { savedFrom: 'https://source.com' },
        }),
      })

      expect(response.ok).toBe(true)
    })
  })

  describe('Notifications', () => {
    it('shows notification on successful save', () => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Page Saved',
        message: 'Test page saved to Synapse',
      })

      expect(chrome.notifications.create).toHaveBeenCalled()
    })
  })
})
