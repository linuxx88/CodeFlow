import fs from 'fs/promises'
import type { Stats } from 'fs'
import path from 'path'

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', '.states', '.web', 'dist', 'build'
])

export interface ScanNode {
  name: string
  type: 'directory' | 'file' | 'unknown'
  relative_path: string
  size?: number
  children?: ScanNode[]
  error?: {
    message: string
    code: string
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const err = new Error('The operation was aborted.')
    err.name = 'AbortError'
    throw err
  }
}

function toPosixRelative(rootPath: string, targetPath: string): string {
  return path.relative(rootPath, targetPath).replace(/\\/g, '/')
}

export async function scanDir(dirPath: string, rootPath: string, signal?: AbortSignal): Promise<ScanNode | null> {
  throwIfAborted(signal)
  const name = path.basename(dirPath) || dirPath
  const relativePath = toPosixRelative(rootPath, dirPath)

  let stats: Stats
  try {
    stats = await fs.stat(dirPath)
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') throw e
    const err = e as NodeJS.ErrnoException
    return {
      name,
      type: 'unknown',
      relative_path: relativePath,
      error: {
        message: err.message || String(e),
        code: err.code || 'UNKNOWN'
      }
    }
  }

  if (stats.isDirectory()) {
    if (EXCLUDED_DIRS.has(name)) return null

    const children: ScanNode[] = []
    let error: ScanNode['error']
    try {
      const files = await fs.readdir(dirPath)
      for (const file of files) {
        throwIfAborted(signal)
        const child = await scanDir(path.join(dirPath, file), rootPath, signal)
        if (child) children.push(child)
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') throw e
      const err = e as NodeJS.ErrnoException
      error = {
        message: err.message || String(e),
        code: err.code || 'UNKNOWN'
      }
    }

    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })

    const dirNode: ScanNode = {
      name,
      type: 'directory',
      relative_path: relativePath,
      children
    }
    if (error) {
      dirNode.error = error
    }
    return dirNode
  }

  return {
    name,
    type: 'file',
    size: stats.size,
    relative_path: relativePath
  }
}

export async function getAllFiles(
  dirPath: string,
  rootPath: string,
  fileList: string[] = [],
  signal?: AbortSignal
): Promise<string[]> {
  throwIfAborted(signal)
  try {
    const files = await fs.readdir(dirPath)
    for (const file of files) {
      throwIfAborted(signal)
      const fullPath = path.join(dirPath, file)
      let stats: Stats
      try {
        stats = await fs.stat(fullPath)
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') throw e
        console.error(`Error stating file ${fullPath}:`, e instanceof Error ? e.message : e)
        continue
      }
      if (stats.isDirectory()) {
        if (!EXCLUDED_DIRS.has(file)) {
          await getAllFiles(fullPath, rootPath, fileList, signal)
        }
      } else {
        fileList.push(toPosixRelative(rootPath, fullPath))
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') throw e
    console.error(`Error reading directory ${dirPath}:`, e instanceof Error ? e.message : e)
  }
  return fileList
}
