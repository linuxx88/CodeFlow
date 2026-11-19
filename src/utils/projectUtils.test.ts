import { describe, it, expect } from 'vitest'
import {
  fuzzyMatch,
  flattenFullTree,
  flattenTree,
  checkIsWebProject,
} from './projectUtils'
import type { FileStructureNode } from '../types'

describe('projectUtils', () => {
  describe('fuzzyMatch', () => {
    it('matches empty query and handles empty text', () => {
      expect(fuzzyMatch('App.tsx', '')).toBe(true)
      expect(fuzzyMatch('', '')).toBe(true)
      expect(fuzzyMatch('', 'app')).toBe(false)
    })

    it('matches case-insensitive subsequences', () => {
      expect(fuzzyMatch('FlowElementBuilder.ts', 'feb')).toBe(true)
      expect(fuzzyMatch('FlowElementBuilder.ts', 'xyz')).toBe(false)
    })
  })

  describe('flattenFullTree and flattenTree', () => {
    const tree: FileStructureNode = {
      name: 'root',
      type: 'directory',
      relative_path: '',
      children: [
        {
          name: 'src',
          type: 'directory',
          relative_path: 'src',
          children: [
            { name: 'small.ts', type: 'file', relative_path: 'src/small.ts', size: 512 },
            { name: 'med.ts', type: 'file', relative_path: 'src/med.ts', size: 2048 },
          ],
        },
        { name: 'big.bin', type: 'file', relative_path: 'big.bin', size: 2 * 1024 * 1024 },
      ],
    }

    it('returns empty array for null input', () => {
      expect(flattenFullTree(null)).toEqual([])
      expect(flattenTree(null, {})).toEqual([])
    })

    it('flattens full tree with formatted file sizes', () => {
      const flat = flattenFullTree(tree)
      expect(flat.map((i) => i.name)).toEqual(['root', 'src', 'small.ts', 'med.ts', 'big.bin'])
      expect(flat.find((i) => i.name === 'small.ts')?.sizeStr).toBe('512 B')
      expect(flat.find((i) => i.name === 'med.ts')?.sizeStr).toBe('2.0 KB')
      expect(flat.find((i) => i.name === 'big.bin')?.sizeStr).toBe('2.0 MB')
    })

    it('respects collapsed directories in flattenTree', () => {
      const flat = flattenTree(tree, { src: true })
      expect(flat.map((i) => i.name)).toEqual(['root', 'src', 'big.bin'])
      expect(flat.find((i) => i.name === 'src')?.isCollapsed).toBe(true)
    })
  })

  describe('checkIsWebProject', () => {
    it('returns false for empty or non-web projects including extensionless files', () => {
      expect(checkIsWebProject(null)).toBe(false)
      expect(
        checkIsWebProject({
          dependencies: {
            nodes: [
              { id: 'Makefile', type: 'file' },
              { id: 'main.py', type: 'file' },
              { id: 'react', type: 'package' },
            ],
            links: [],
          },
        })
      ).toBe(false)
    })

    it('returns true when a web file extension is present', () => {
      expect(
        checkIsWebProject({
          dependencies: {
            nodes: [{ id: 'src/App.tsx', type: 'file' }],
            links: [],
          },
        })
      ).toBe(true)
    })
  })
})
