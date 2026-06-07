import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scanDir, getAllFiles } from './fileScanner'
import fs from 'fs/promises'
import path from 'path'

vi.mock('fs/promises', () => {
  const mockFiles: Record<string, { isDirectory: boolean; size?: number; children?: string[]; error?: any }> = {
    '/mock/project': { isDirectory: true, children: ['src', 'node_modules', 'README.md', 'unreadable'] },
    '/mock/project/src': { isDirectory: true, children: ['index.js'] },
    '/mock/project/src/index.js': { isDirectory: false, size: 120 },
    '/mock/project/node_modules': { isDirectory: true, children: ['react'] },
    '/mock/project/README.md': { isDirectory: false, size: 250 },
    '/mock/project/unreadable': { isDirectory: true, children: [] } // readdir will fail for this path
  }

  return {
    default: {
      stat: vi.fn().mockImplementation(async (filePath: string) => {
        const normalized = path.normalize(filePath).replace(/\\/g, '/')
        const file = mockFiles[normalized]
        if (!file) {
          const err = new Error(`File not found: ${normalized}`) as any
          err.code = 'ENOENT'
          throw err
        }
        return {
          isDirectory: () => file.isDirectory,
          size: file.size || 0
        }
      }),
      readdir: vi.fn().mockImplementation(async (dirPath: string) => {
        const normalized = path.normalize(dirPath).replace(/\\/g, '/')
        if (normalized === '/mock/project/unreadable') {
          const err = new Error('Permission denied') as any
          err.code = 'EACCES'
          throw err
        }
        const file = mockFiles[normalized]
        if (!file) {
          const err = new Error(`Directory not found: ${normalized}`) as any
          err.code = 'ENOENT'
          throw err
        }
        return file.children || []
      })
    }
  }
})

describe('fileScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('scanDir', () => {
    it('should scan directory structure recursively and exclude EXCLUDED_DIRS', async () => {
      const root = '/mock/project'
      const result = await scanDir(root, root)

      expect(result).toBeDefined()
      expect(result?.type).toBe('directory')
      expect(result?.name).toBe('project')

      // Children should include 'src' and 'README.md', and 'unreadable', but NOT 'node_modules'
      const childNames = result?.children?.map(c => c.name)
      expect(childNames).toContain('src')
      expect(childNames).toContain('README.md')
      expect(childNames).toContain('unreadable')
      expect(childNames).not.toContain('node_modules')

      // Verify nested file
      const srcNode = result?.children?.find(c => c.name === 'src')
      expect(srcNode?.children?.[0].name).toBe('index.js')
      expect(srcNode?.children?.[0].type).toBe('file')
      expect(srcNode?.children?.[0].size).toBe(120)
    })

    it('should propagate error details when directory is unreadable', async () => {
      const root = '/mock/project'
      const result = await scanDir(root, root)

      const unreadableNode = result?.children?.find(c => c.name === 'unreadable')
      expect(unreadableNode).toBeDefined()
      expect(unreadableNode?.error).toBeDefined()
      expect(unreadableNode?.error?.code).toBe('EACCES')
      expect(unreadableNode?.error?.message).toContain('Permission denied')
    })

    it('should abort operation if AbortSignal is aborted', async () => {
      const controller = new AbortController()
      controller.abort()

      await expect(scanDir('/mock/project', '/mock/project', controller.signal)).rejects.toThrow('The operation was aborted.')
    })
  })

  describe('getAllFiles', () => {
    it('should get flat list of relative file paths, respecting exclusions', async () => {
      const root = '/mock/project'
      const fileList: string[] = []
      const result = await getAllFiles(root, root, fileList)

      // node_modules/react should be ignored, and only files (README.md, src/index.js) are returned
      // Note: 'unreadable' is a directory, not a file, and readdir on it will fail and log error, but keep going.
      const normalizedResult = result.map(f => f.replace(/\\/g, '/'))
      expect(normalizedResult).toContain('README.md')
      expect(normalizedResult).toContain('src/index.js')
      expect(normalizedResult).not.toContain('node_modules/react')
    })
  })
})
