import path from 'path'

function normalizeCandidate(candidate: string): string {
  return candidate.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^\.\//, '')
}

export function resolvePythonImport(
  importingFile: string,
  moduleName: string,
  nodesMap: Map<string, unknown>
): string | null {
  if (!moduleName) return null

  const leadingDotsMatch = moduleName.match(/^(\.+)(.*)$/)
  const relDir = path.posix.dirname(importingFile.replace(/\\/g, '/'))

  const candidates: string[] = []

  if (leadingDotsMatch) {
    const dotCount = leadingDotsMatch[1].length
    const rest = leadingDotsMatch[2]
    let baseDir = relDir === '.' ? '' : relDir
    for (let i = 1; i < dotCount; i++) {
      baseDir = baseDir ? path.posix.dirname(baseDir) : ''
      if (baseDir === '.') baseDir = ''
    }
    const parts = rest ? rest.split('.').filter(Boolean) : []
    if (parts.length > 0) {
      candidates.push(
        path.posix.join(baseDir, ...parts) + '.py',
        path.posix.join(baseDir, ...parts, '__init__.py'),
        path.posix.join(baseDir, parts[0]) + '.py',
        path.posix.join(baseDir, parts[0], '__init__.py')
      )
    } else if (baseDir) {
      candidates.push(path.posix.join(baseDir, '__init__.py'))
    }
  } else {
    const parts = moduleName.split('.').filter(Boolean)
    if (parts.length === 0) return null

    const baseDir = relDir === '.' ? '' : relDir
    candidates.push(
      path.posix.join(baseDir, ...parts) + '.py',
      path.posix.join(baseDir, ...parts, '__init__.py'),
      path.posix.join(baseDir, parts[0]) + '.py',
      path.posix.join(baseDir, parts[0], '__init__.py'),
      path.posix.join(...parts) + '.py',
      path.posix.join(...parts, '__init__.py'),
      path.posix.join(parts[0]) + '.py',
      path.posix.join(parts[0], '__init__.py')
    )
  }

  for (const candidate of candidates) {
    const cleaned = normalizeCandidate(candidate)
    if (nodesMap.has(cleaned)) {
      return cleaned
    }
  }
  return null
}

export function resolveJsImport(
  importingFile: string,
  moduleName: string,
  nodesMap: Map<string, unknown>
): string | null {
  if (!moduleName) return null

  let resolvedPath = moduleName
  if (moduleName.startsWith('@/')) {
    resolvedPath = 'src/' + moduleName.substring(2)
  } else if (moduleName.startsWith('.')) {
    const dir = path.posix.dirname(importingFile.replace(/\\/g, '/'))
    resolvedPath = path.posix.normalize(path.posix.join(dir, moduleName))
  }

  resolvedPath = normalizeCandidate(resolvedPath)

  const extensions = ['', '.ts', '.js', '.tsx', '.jsx', '.json']
  for (const ext of extensions) {
    const cleaned = normalizeCandidate(resolvedPath + ext)
    if (nodesMap.has(cleaned)) {
      return cleaned
    }

    const indexCleaned = normalizeCandidate(path.posix.join(resolvedPath, 'index' + ext))
    if (nodesMap.has(indexCleaned)) {
      return indexCleaned
    }
  }

  // Handle ESM TypeScript imports written with .js/.jsx extensions
  if (resolvedPath.endsWith('.js') || resolvedPath.endsWith('.jsx')) {
    const stem = resolvedPath.replace(/\.jsx?$/, '')
    for (const tsExt of ['.ts', '.tsx']) {
      const cleaned = normalizeCandidate(stem + tsExt)
      if (nodesMap.has(cleaned)) {
        return cleaned
      }
    }
  }

  return null
}
