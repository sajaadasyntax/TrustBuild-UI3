/**
 * Unit tests for utility functions
 */

import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'excluded-class')
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
      expect(result).not.toContain('excluded-class')
    })

    it('should handle tailwind class conflicts correctly', () => {
      const result = cn('p-4', 'p-8')
      // twMerge should keep the last padding class
      expect(result).toBe('p-8')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'other')
      expect(result).toContain('base')
      expect(result).toContain('other')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class-1', 'class-2'], 'class-3')
      expect(result).toContain('class-1')
      expect(result).toContain('class-2')
      expect(result).toContain('class-3')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })
})

