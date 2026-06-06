import fs from 'fs'
import path from 'path'

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', '.states', '.web', 'dist', 'build'
])

export function scanDir(dirPath: string, rootPath: string): any {
  const name = path.basename(dirPath) || dirPath
  const relativePath = path.relative(rootPath, dirPath)
  
  let stats: fs.Stats
  try {
    stats = fs.statSync(dirPath)
  } catch (e) {
    return null
  }
  
  if (stats.isDirectory()) {
    if (EXCLUDED_DIRS.has(name)) return null
    
    const children: any[] = []
    try {
      const files = fs.readdirSync(dirPath)
      for (const file of files) {
        const child = scanDir(path.join(dirPath, file), rootPath)
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

export function getAllFiles(dirPath: string, rootPath: string, fileList: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dirPath)
    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      const stats = fs.statSync(fullPath)
      if (stats.isDirectory()) {
        if (!EXCLUDED_DIRS.has(file)) {
          getAllFiles(fullPath, rootPath, fileList)
        }
      } else {
        fileList.push(path.relative(rootPath, fullPath))
      }
    }
  } catch (e) {}
  return fileList
}
