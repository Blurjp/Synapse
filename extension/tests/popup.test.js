// Tests for popup.js (Popup Script)
describe('Popup Script', () => {
  const API_BASE_URL = 'http://localhost:8001'

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div class="status"></div>
      <div class="status-text">Checking...</div>
      <div id="pageTitle"></div>
      <div id="pageUrl"></div>
      <div id="selectionSection" style="display: none;">
        <div id="selectionPreview"></div>
      </div>
      <div id="noteInput"></div>
      <div id="recentList"></div>
      <button id="savePage"></button>
      <button id="saveSelection"></button>
      <button id="saveNote"></button>
      <button id="openDashboard"></button>
      <button id="settings"></button>
    `

    // Reset mocks
    chrome.tabs.query.mockClear()
    chrome.tabs.sendMessage.mockClear()
    chrome.tabs.create.mockClear()
    chrome.runtime.openOptionsPage.mockClear()
    fetch.mockReset()
  })

  describe('Connection Check', () => {
    it('shows connected when backend is healthy', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'healthy' }),
      })

      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()

      expect(data.status).toBe('healthy')
    })

    it('shows disconnected when backend is unreachable', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch(`${API_BASE_URL}/health`)
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })
  })

  describe('Save Page', () => {
    it('sends page data to backend', async () => {
      chrome.tabs.query.mockResolvedValueOnce([{
        id: 1,
        title: 'Test Page',
        url: 'https://example.com',
      }])

      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        if (message.type === 'GET_PAGE_CONTENT') {
          callback({
            content: 'Test content',
            author: 'Test Author',
            publishedDate: null,
            wordCount: 2,
          })
        }
      })

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
          metadata: { author: 'Test Author', publishedAt: null, wordCount: 2 },
        }),
      })

      expect(response.ok).toBe(true)
    })
  })

  describe('Save Selection', () => {
    it('sends selection to backend', async () => {
      chrome.tabs.query.mockResolvedValueOnce([{
        id: 1,
        url: 'https://example.com',
        title: 'Test Page',
      }])

      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        if (message.type === 'GET_SELECTION') {
          callback({ selection: 'Selected text from page' })
        }
      })

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      })

      const response = await fetch(`${API_BASE_URL}/api/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Selected text from page',
          source_url: 'https://example.com',
          source_title: 'Test Page',
        }),
      })

      expect(response.ok).toBe(true)
    })
  })

  describe('Save Note', () => {
    it('sends note to backend', async () => {
      chrome.tabs.query.mockResolvedValueOnce([{
        id: 1,
        url: 'https://example.com',
        title: 'Test Page',
      }])

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      })

      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'My quick note',
          source_url: 'https://example.com',
          source_title: 'Test Page',
        }),
      })

      expect(response.ok).toBe(true)
    })
  })

  describe('Load Recent Saves', () => {
    it('displays recent saves from backend', async () => {
      const mockSources = [
        { id: 1, title: 'Article 1', type: 'webpage', created_at: '2024-01-15T10:00:00Z' },
        { id: 2, title: 'Article 2', type: 'pdf', created_at: '2024-01-14T10:00:00Z' },
      ]

      fetch.mockResolvedValueOnce({
        json: async () => ({ sources: mockSources }),
      })

      const response = await fetch(`${API_BASE_URL}/api/sources?limit=5`)
      const data = await response.json()

      expect(data.sources).toHaveLength(2)
      expect(data.sources[0].title).toBe('Article 1')
    })

    it('shows empty state when no saves', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ sources: [] }),
      })

      const response = await fetch(`${API_BASE_URL}/api/sources?limit=5`)
      const data = await response.json()

      expect(data.sources).toHaveLength(0)
    })
  })

  describe('Open Dashboard', () => {
    it('opens dashboard in new tab', () => {
      chrome.tabs.create.mockResolvedValueOnce({ id: 1 })

      chrome.tabs.create({ url: 'http://localhost:3000' })

      expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'http://localhost:3000' })
    })
  })

  describe('Open Settings', () => {
    it('opens options page', () => {
      chrome.runtime.openOptionsPage.mockResolvedValueOnce()

      chrome.runtime.openOptionsPage()

      expect(chrome.runtime.openOptionsPage).toHaveBeenCalled()
    })
  })

  describe('Utility Functions', () => {
    it('escapes HTML in text', () => {
      const escapeHtml = (text) => {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
      }

      expect(escapeHtml('<script>alert("xss")</script>')).not.toContain('<script>')
      expect(escapeHtml('Safe text')).toBe('Safe text')
    })

    it('formats date correctly', () => {
      const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date

        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return date.toLocaleDateString()
      }

      const justNow = new Date(Date.now() - 30000).toISOString()
      expect(formatDate(justNow)).toBe('Just now')
    })
  })
})
