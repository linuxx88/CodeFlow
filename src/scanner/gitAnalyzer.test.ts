import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeGit } from './gitAnalyzer'
import fs from 'fs/promises'

const { mockExecPromisified } = vi.hoisted(() => {
  return {
    mockExecPromisified: vi.fn()
  }
})

vi.mock('child_process', () => {
  const execMock = vi.fn()
  // @ts-ignore
  execMock[Symbol.for('nodejs.util.promisify.custom')] = mockExecPromisified
  return {
    exec: execMock,
    default: {
      exec: execMock
    }
  }
})

vi.mock('fs/promises', () => {
  return {
    default: {
      readFile: vi.fn()
    }
  }
})

describe('gitAnalyzer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return is_git: false when directory is not inside a git worktree', async () => {
    mockExecPromisified.mockRejectedValue(new Error('Not a git repository'))

    const result = await analyzeGit('/mock/path', new Set())
    expect(result.is_git).toBe(false)
    expect(result.hotspots).toEqual([])
    expect(result.statuses).toEqual({})
  })

  it('should parse statuses and calculate correct hotspots when git repo is active', async () => {
    mockExecPromisified.mockImplementation(async (cmd: string) => {
      if (cmd.includes('git rev-parse')) {
        return { stdout: 'true\n', stderr: '' }
      } else if (cmd.includes('git status')) {
        const statusOutput = [
          '?? untracked.js',
          ' M modified.js',
          'A  added.js',
          'D  deleted.js',
          'R  old.js -> renamed.js',
          'UU conflict.js'
        ].join('\n')
        return { stdout: statusOutput, stderr: '' }
      } else if (cmd.includes('git log')) {
        const logOutput = [
          'COMMIT:alice@example.com',
          'modified.js',
          'added.js',
          'COMMIT:bob@example.com',
          'modified.js',
          'conflict.js'
        ].join('\n')
        return { stdout: logOutput, stderr: '' }
      }
      return { stdout: '', stderr: '' }
    })

    // Mock fs.readFile to check conflict markings for conflict.js
    const mockReadFile = fs.readFile as any as typeof vi.fn
    mockReadFile.mockImplementation((file: string) => {
      if (file.includes('conflict.js')) {
        return Promise.resolve('<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> branch')
      }
      return Promise.resolve('clean file')
    })

    const existingFiles = new Set(['modified.js', 'added.js', 'conflict.js', 'untracked.js'])
    const result = await analyzeGit('/mock/path', existingFiles)

    expect(result.is_git).toBe(true)

    // Check statuses mapping
    expect(result.statuses).toEqual({
      'untracked.js': 'untracked',
      'modified.js': 'modified',
      'added.js': 'added',
      'deleted.js': 'deleted',
      'renamed.js': 'renamed',
      'conflict.js': 'unmerged'
    })

    // Check hotspots mapping
    const modifiedHotspot = result.hotspots.find(h => h.file === 'modified.js')
    expect(modifiedHotspot).toBeDefined()
    expect(modifiedHotspot.commits).toBe(2)
    expect(modifiedHotspot.authors).toBe(2)
    expect(modifiedHotspot.score).toBe(4)
    expect(modifiedHotspot.hasConflicts).toBe(false)

    const conflictHotspot = result.hotspots.find(h => h.file === 'conflict.js')
    expect(conflictHotspot).toBeDefined()
    expect(conflictHotspot.commits).toBe(1)
    expect(conflictHotspot.authors).toBe(1)
    expect(conflictHotspot.score).toBe(1)
    expect(conflictHotspot.hasConflicts).toBe(true)
  })
})
