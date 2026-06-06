import fs from 'fs/promises'
import path from 'path'

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', '.states', '.web', 'dist', 'build'
])

export async function scanDir(dirPath: string, rootPath: string): Promise<any> {
  const name = path.basename(dirPath) || dirPath
  const relativePath = path.relative(rootPath, dirPath)
  
  let stats: any
  try {
    stats = await fs.stat(dirPath)
  } catch (e) {
    return null
  }
  
  if (stats.isDirectory()) {
    if (EXCLUDED_DIRS.has(name)) return null
    
    const children: any[] = []
    try {
      const files = await fs.readdir(dirPath)
      for (const file of files) {
        const child = await scanDir(path.join(dirPath, file), rootPath)
        if (child) children.push(child)
      }
    } catch (e) {}
    
    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })
    
    return {
      name,
      type: 'directory',
      relative_path: relativePath,
      children
    }
  } else {
    return {
      name,
      type: 'file',
      size: stats.size,
      relative_path: relativePath
    }
  }
}

export async function getAllFiles(dirPath: string, rootPath: string, fileList: string[] = []): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath)
    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      let stats: any
      try {
        stats = await fs.stat(fullPath)
      } catch (e) {
        continue
      }
      if (stats.isDirectory()) {
        if (!EXCLUDED_DIRS.has(file)) {
          await getAllFiles(fullPath, rootPath, fileList)
        }
      } else {
        fileList.push(path.relative(rootPath, fullPath))
      }
    }
  } catch (e) {}
  return fileList
}
