import { cn, formatDate, truncate, generateId, isValidUrl } from '../lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })
  })

  describe('formatDate', () => {
    it('formats Date object', () => {
      const date = new Date('2024-03-15')
      expect(formatDate(date)).toBe('March 15, 2024')
    })

    it('formats date string', () => {
      expect(formatDate('2024-03-15')).toBe('March 15, 2024')
    })
  })

  describe('truncate', () => {
    it('returns text if shorter than max', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('truncates text with ellipsis', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })
  })

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('isValidUrl', () => {
    it('returns true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
    })
  })
})
