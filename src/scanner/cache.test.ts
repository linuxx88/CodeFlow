import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs/promises'
import { loadCache, saveCache } from './cache'

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn()
  }
}))

describe('scanner cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty projects when cache file does not exist', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    const cache = await loadCache()
    expect(cache).toEqual({ projects: {} })
  })

  it('should return empty projects when cache JSON is malformed or missing projects object', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('not json')
    expect(await loadCache()).toEqual({ projects: {} })

    vi.mocked(fs.readFile).mockResolvedValueOnce('null')
    expect(await loadCache()).toEqual({ projects: {} })

    vi.mocked(fs.readFile).mockResolvedValueOnce('[]')
    expect(await loadCache()).toEqual({ projects: {} })

    vi.mocked(fs.readFile).mockResolvedValueOnce('{"projects": []}')
    expect(await loadCache()).toEqual({ projects: {} })
  })

  it('should return parsed cache when valid', async () => {
    const valid = {
      projects: {
        'E:/CodeFlow': {
          lastScanned: 12345,
          files: {},
          git: { hotspots: [], is_git_repo: true }
        }
      }
    }
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(valid))
    expect(await loadCache()).toEqual(valid)
  })

  it('should create directory and write cache file on saveCache', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    await saveCache({ projects: {} })
    expect(fs.mkdir).toHaveBeenCalledTimes(1)
    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })
})
