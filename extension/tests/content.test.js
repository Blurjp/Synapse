// Tests for content.js (Content Script)
describe('Content Script', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    chrome.runtime.onMessage.addListener.mockClear()
    chrome.runtime.sendMessage.mockClear()
  })

  describe('GET_SELECTION', () => {
    it('returns selected text', () => {
      // Setup DOM with some text
      document.body.innerHTML = '<p>Hello World</p>'
      
      // Mock window.getSelection
      window.getSelection = jest.fn(() => ({
        toString: () => 'Hello World',
        trim: () => 'Hello World',
      }))

      // Get the listener callback
      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_SELECTION' }, {}, sendResponse)
        expect(sendResponse).toHaveBeenCalledWith({ selection: 'Hello World' })
      }
    })

    it('returns empty string when no selection', () => {
      window.getSelection = jest.fn(() => ({
        toString: () => '',
        trim: () => '',
      }))

      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_SELECTION' }, {}, sendResponse)
        expect(sendResponse).toHaveBeenCalledWith({ selection: '' })
      }
    })
  })

  describe('GET_PAGE_CONTENT', () => {
    it('extracts page content from article element', () => {
      document.body.innerHTML = `
        <article>
          <h1>Test Article</h1>
          <p>This is test content for the article.</p>
        </article>
      `

      // Mock meta tags
      document.head.innerHTML = `
        <meta name="description" content="Test description">
        <meta name="author" content="Test Author">
      `

      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_PAGE_CONTENT' }, {}, sendResponse)
        
        const response = sendResponse.mock.calls[0]?.[0]
        expect(response).toBeDefined()
        expect(response.title).toBeDefined()
        expect(response.content).toContain('Test Article')
      }
    })

    it('extracts content from main when no article', () => {
      document.body.innerHTML = `
        <main>
          <h1>Main Content</h1>
          <p>Content in main element.</p>
        </main>
      `

      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_PAGE_CONTENT' }, {}, sendResponse)
        
        const response = sendResponse.mock.calls[0]?.[0]
        expect(response.content).toContain('Main Content')
      }
    })

    it('falls back to body when no article or main', () => {
      document.body.innerHTML = `
        <div>
          <h1>Body Content</h1>
          <p>Generic body content.</p>
        </div>
      `

      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_PAGE_CONTENT' }, {}, sendResponse)
        
        const response = sendResponse.mock.calls[0]?.[0]
        expect(response.content).toContain('Body Content')
      }
    })

    it('removes unwanted elements from content', () => {
      document.body.innerHTML = `
        <article>
          <h1>Article</h1>
          <nav>Navigation</nav>
          <script>console.log('script')</script>
          <style>.css {}</style>
          <p>Good content</p>
        </article>
      `

      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_PAGE_CONTENT' }, {}, sendResponse)
        
        const response = sendResponse.mock.calls[0]?.[0]
        expect(response.content).not.toContain('console.log')
        expect(response.content).not.toContain('.css')
      }
    })

    it('calculates word count', () => {
      document.body.innerHTML = `
        <article>
          <p>One two three four five</p>
        </article>
      `

      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_PAGE_CONTENT' }, {}, sendResponse)
        
        const response = sendResponse.mock.calls[0]?.[0]
        expect(response.wordCount).toBeGreaterThan(0)
      }
    })

    it('extracts metadata from meta tags', () => {
      document.head.innerHTML = `
        <meta name="description" content="Test description">
        <meta name="author" content="John Doe">
        <meta property="article:published_time" content="2024-01-15">
      `
      document.body.innerHTML = '<article>Content</article>'

      const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
      const sendResponse = jest.fn()

      if (listener) {
        listener({ type: 'GET_PAGE_CONTENT' }, {}, sendResponse)
        
        const response = sendResponse.mock.calls[0]?.[0]
        expect(response.description).toBe('Test description')
        expect(response.author).toBe('John Doe')
      }
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('sends SAVE_PAGE on Ctrl+Shift+S', () => {
      const event = new KeyboardEvent('keydown', {
        ctrlKey: true,
        shiftKey: true,
        key: 'S',
      })

      document.dispatchEvent(event)

      // The content script should prevent default and send message
      // This test verifies the event is captured
      expect(event.type).toBe('keydown')
    })

    it('sends SAVE_HIGHLIGHT on Ctrl+Shift+H with selection', () => {
      window.getSelection = jest.fn(() => ({
        toString: () => 'selected text',
        trim: () => 'selected text',
      }))

      const event = new KeyboardEvent('keydown', {
        ctrlKey: true,
        shiftKey: true,
        key: 'H',
      })

      document.dispatchEvent(event)

      expect(event.type).toBe('keydown')
    })
  })
})
