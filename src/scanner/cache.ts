import fs from 'fs/promises'
import os from 'os'
import path from 'path'

const CACHE_FILE_PATH = path.join(os.homedir(), '.gemini', 'antigravity', 'scan_cache.json')

export interface FileCacheData {
  mtime: number
  dependencies: string[]
  conditionals: any[]
  classes: any[]
  loops: any[]
  repeatLoops: any[]
  algorithms: any[]
  pythonStructures: any[]
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
    const parsed: unknown = JSON.parse(content)
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      'projects' in parsed &&
      parsed.projects &&
      typeof parsed.projects === 'object' &&
      !Array.isArray(parsed.projects)
    ) {
      return parsed as CacheSchema
    }
    return { projects: {} }
  } catch {
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
