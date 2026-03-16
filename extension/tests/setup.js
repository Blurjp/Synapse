// Test setup for Chrome extension
require('whatwg-fetch')

// Mock Chrome APIs
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    onInstalled: {
      addListener: jest.fn(),
    },
    openOptionsPage: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn(),
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
  commands: {
    onCommand: {
      addListener: jest.fn(),
    },
  },
  notifications: {
    create: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
}

// Mock fetch for unit tests
global.fetch = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  fetch.mockReset()
})
