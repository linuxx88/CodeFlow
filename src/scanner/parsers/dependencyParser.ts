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
