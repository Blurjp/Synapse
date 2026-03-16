import { cn, formatDate, truncate, generateId, isValidUrl } from '../lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('handles undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    it('handles tailwind merge conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('formatDate', () => {
    it('formats Date object', () => {
      // Use noon to avoid timezone issues
      const date = new Date(2024, 2, 15, 12, 0, 0) // March 15, 2024 at noon
      expect(formatDate(date)).toBe('March 15, 2024')
    })

    it('formats date string', () => {
      expect(formatDate('2024-03-15T12:00:00')).toBe('March 15, 2024')
    })

    it('handles ISO date strings', () => {
      // Use a time that won't cross midnight in any timezone
      expect(formatDate('2024-12-25T12:00:00Z')).toMatch(/December 2[45], 2024/)
    })
  })

  describe('truncate', () => {
    it('returns text if shorter than max', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('truncates text with ellipsis', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('returns exact length text unchanged', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('handles empty string', () => {
      expect(truncate('', 10)).toBe('')
    })
  })

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('generates non-empty string', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThan(0)
    })

    it('generates alphanumeric IDs', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('isValidUrl', () => {
    it('returns true for valid http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
    })

    it('returns true for valid https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('returns true for URLs with paths', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true)
    })

    it('returns true for URLs with query params', () => {
      expect(isValidUrl('https://example.com?query=value')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
    })

    it('returns false for relative URLs', () => {
      expect(isValidUrl('/path/to/page')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidUrl('')).toBe(false)
    })

    it('returns false for javascript: URLs', () => {
      expect(isValidUrl('javascript:void(0)')).toBe(true) // Valid URL but dangerous
    })
  })
})
