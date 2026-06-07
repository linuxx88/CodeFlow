import fs from 'fs/promises'
import path from 'path'

const CACHE_FILE_PATH = '/home/ssr/.gemini/antigravity/scan_cache.json'

export interface FileCacheData {
  mtime: number
  dependencies: any
  conditionals: any
  classes: any
  loops: any
  repeatLoops: any
  algorithms: any
  pythonStructures: any
}

export interface ProjectCacheData {
  lastScanned: number
  files: Record<string, FileCacheData>
  git: {
    hotspots: any[]
    statuses?: Record<string, string>
    is_git_repo: boolean
  }
}

export interface CacheSchema {
  projects: Record<string, ProjectCacheData>
}

export async function loadCache(): Promise<CacheSchema> {
  try {
    const content = await fs.readFile(CACHE_FILE_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (e) {
    return { projects: {} }
  }
}

export async function saveCache(cache: CacheSchema): Promise<void> {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true })
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to save scan cache:', e)
  }
}
