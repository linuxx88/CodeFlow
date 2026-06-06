import fs from 'fs'
import path from 'path'

export function resolvePythonImport(importingFile: string, moduleName: string, nodesMap: Map<string, any>): string | null {
  const parts = moduleName.split('.')
  const relDir = path.dirname(importingFile)
  
  const relativeCandidates = [
    path.normalize(path.join(relDir, ...parts)) + '.py',
    path.normalize(path.join(relDir, ...parts, '__init__.py')),
    path.normalize(path.join(relDir, parts[0])) + '.py',
    path.normalize(path.join(relDir, parts[0], '__init__.py')),
  ]
  
  const rootCandidates = [
    path.normalize(path.join(...parts)) + '.py',
    path.normalize(path.join(...parts, '__init__.py')),
    path.normalize(path.join(parts[0])) + '.py',
    path.normalize(path.join(parts[0], '__init__.py')),
  ]

  const allCandidates = [...relativeCandidates, ...rootCandidates]
  for (let candidate of allCandidates) {
    if (candidate.startsWith('/')) {
      candidate = candidate.substring(1)
    }
    if (candidate.startsWith('./')) {
      candidate = candidate.substring(2)
    }
    const cleaned = candidate.replace(/\\/g, '/')
    if (nodesMap.has(cleaned)) {
      return cleaned
    }
  }
  return null
}

export function resolveJsImport(importingFile: string, moduleName: string, nodesMap: Map<string, any>): string | null {
  let resolvedPath = moduleName
  if (moduleName.startsWith('@/')) {
    resolvedPath = 'src/' + moduleName.substring(2)
  }
  
  if (resolvedPath.startsWith('/')) {
    resolvedPath = resolvedPath.substring(1)
  }

  if (moduleName.startsWith('.')) {
    const dir = path.dirname(importingFile)
    resolvedPath = path.normalize(path.join(dir, moduleName))
    if (resolvedPath.startsWith('/')) resolvedPath = resolvedPath.substring(1)
  }

  const extensions = ['', '.ts', '.js', '.tsx', '.jsx', '.json']
  for (const ext of extensions) {
    const candidate = resolvedPath + ext
    const cleaned = candidate.replace(/\\/g, '/').replace(/^\.\//, '')
    if (nodesMap.has(cleaned)) {
      return cleaned
    }
    
    const indexCandidate = path.join(resolvedPath, 'index' + ext)
    const indexCleaned = indexCandidate.replace(/\\/g, '/').replace(/^\.\//, '')
    if (nodesMap.has(indexCleaned)) {
      return indexCleaned
    }
  }

  for (const ext of extensions) {
    const candidate = resolvedPath + ext
    const cleaned = candidate.replace(/\\/g, '/')
    if (nodesMap.has(cleaned)) {
      return cleaned
    }
    const indexCandidate = path.join(resolvedPath, 'index' + ext)
    const indexCleaned = indexCandidate.replace(/\\/g, '/')
    if (nodesMap.has(indexCleaned)) {
      return indexCleaned
    }
  }

  return null
}

export function parseDependencies(files: string[], rootPath: string) {
  const nodesMap = new Map<string, { id: string; type: 'file' | 'package' }>()
  const links: Array<{ source: string; target: string; type: 'internal' | 'external' }> = []
  
  for (const file of files) {
    nodesMap.set(file, { id: file, type: 'file' })
  }
  
  const pyImportRegex = /^\s*(?:import\s+([\w.,\s]+)|from\s+([\w.]+)\s+import\s+([\w.,\s*()]+))/mg
  const jsImportRegex = /^\s*(?:import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/mg
  
  for (const file of files) {
    const ext = path.extname(file)
    if (ext !== '.py' && ext !== '.js' && ext !== '.ts' && ext !== '.jsx' && ext !== '.tsx') continue
    
    let content = ''
    try {
      content = fs.readFileSync(path.join(rootPath, file), 'utf-8')
    } catch (e) {
      continue
    }
    
    const targets = new Set<string>()
    
    if (ext === '.py') {
      let match
      pyImportRegex.lastIndex = 0
      while ((match = pyImportRegex.exec(content)) !== null) {
        if (match[1]) {
          const imports = match[1].split(',')
          for (let imp of imports) {
            imp = imp.trim()
            if (imp) {
              const resolved = resolvePythonImport(file, imp, nodesMap)
              if (resolved) {
                targets.add(resolved)
              } else {
                targets.add(imp.split('.')[0])
              }
            }
          }
        } else if (match[2]) {
          const fromMod = match[2].trim()
          if (fromMod) {
            const resolved = resolvePythonImport(file, fromMod, nodesMap)
            if (resolved) {
              targets.add(resolved)
            } else {
              targets.add(fromMod.split('.')[0])
            }
          }
        }
      }
    } else {
      let match
      jsImportRegex.lastIndex = 0
      while ((match = jsImportRegex.exec(content)) !== null) {
        const moduleName = match[1] || match[2]
        if (moduleName) {
          const resolved = resolveJsImport(file, moduleName, nodesMap)
          if (resolved) {
            targets.add(resolved)
          } else {
            let pkgName = moduleName
            if (moduleName.startsWith('@')) {
              const parts = moduleName.split('/')
              pkgName = parts.slice(0, 2).join('/')
            } else {
              pkgName = moduleName.split('/')[0]
            }
            targets.add(pkgName)
          }
        }
      }
    }
    
    for (const target of targets) {
      if (nodesMap.has(target)) {
        links.push({ source: file, target, type: 'internal' })
      } else {
        nodesMap.set(target, { id: target, type: 'package' })
        links.push({ source: file, target, type: 'external' })
      }
    }
  }
  
  return {
    nodes: Array.from(nodesMap.values()),
    links
  }
}
