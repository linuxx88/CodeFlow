import fs from 'fs/promises'
import path from 'path'
import { scanDir, getAllFiles } from './fileScanner'
import { analyzeGit } from './gitAnalyzer'
import { loadCache, saveCache } from './cache'
import type { ProjectCacheData, FileCacheData } from './cache'
import { resolvePythonImport, resolveJsImport } from './parsers/dependencyParser'
import {
  parseConditionalsFromFile,
  parseClassesFromFile,
  parseLoopsFromFile,
  parseRepeatLoopsFromFile,
  parseAlgorithmsFromFile,
  parsePythonStructuresFromFile
} from './parser'

export interface ScanProgress {
  stage: 'reading' | 'parsing' | 'git' | 'saving' | 'complete'
  current?: number
  total?: number
  message: string
}

function extractImports(content: string, ext: string): string[] {
  const targets = new Set<string>()
  if (ext === '.py') {
    const pyImportRegex = /^\s*(?:import\s+([\w.,\s]+)|from\s+([\w.]+)\s+import\s+([\w.,\s*()]+))/mg
    let match
    while ((match = pyImportRegex.exec(content)) !== null) {
      if (match[1]) {
        const imports = match[1].split(',')
        for (let imp of imports) {
          imp = imp.trim()
          if (imp) targets.add(imp)
        }
      } else if (match[2]) {
        const fromMod = match[2].trim()
        if (fromMod) targets.add(fromMod)
      }
    }
  } else {
    const jsImportRegex = /^\s*(?:import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/mg
    let match
    while ((match = jsImportRegex.exec(content)) !== null) {
      const moduleName = match[1] || match[2]
      if (moduleName) targets.add(moduleName)
    }
  }
  return Array.from(targets)
}

export async function handleScan(
  projectPath: string,
  onProgress?: (progress: ScanProgress) => void
) {
  const resolvedPath = path.resolve(projectPath)
  
  // 1. Check folder existence
  try {
    const stats = await fs.stat(resolvedPath)
    if (!stats.isDirectory()) {
      throw new Error('Project path is not a directory')
    }
  } catch (e: any) {
    throw new Error('Project path does not exist: ' + resolvedPath, { cause: e })
  }

  // 2. Load Cache
  const cache = await loadCache()
  const projectCache: ProjectCacheData = cache.projects[resolvedPath] || {
    lastScanned: 0,
    files: {},
    git: { hotspots: [], is_git_repo: false }
  }

  // 3. Scan directory structure and files
  if (onProgress) {
    onProgress({ stage: 'reading', message: 'Lecture de la structure des dossiers...' })
  }
  const structure = await scanDir(resolvedPath, resolvedPath)
  const files = await getAllFiles(resolvedPath, resolvedPath)
  const filesSet = new Set(files)

  // 4. Parse files with Cache Validation
  const totalFiles = files.length
  let parsedCount = 0
  
  const conditionals: any[] = []
  const classes: any[] = []
  const loops: any[] = []
  const repeatLoops: any[] = []
  const algorithms: any[] = []
  const pythonStructures: any[] = []
  const fileRawImports: Record<string, string[]> = {}

  const newProjectCacheFiles: Record<string, FileCacheData> = {}

  for (const file of files) {
    parsedCount++
    const ext = path.extname(file)
    const isSupported = ext === '.py' || ext === '.js' || ext === '.ts' || ext === '.jsx' || ext === '.tsx'

    if (onProgress && parsedCount % 10 === 0) {
      onProgress({
        stage: 'parsing',
        current: parsedCount,
        total: totalFiles,
        message: `Analyse du fichier ${parsedCount}/${totalFiles}...`
      })
    }

    if (!isSupported) {
      continue
    }

    const fullFilePath = path.join(resolvedPath, file)
    let fileStats: any
    try {
      fileStats = await fs.stat(fullFilePath)
    } catch (e) {
      continue
    }

    const mtime = fileStats.mtimeMs
    const cachedFile = projectCache.files[file]

    if (cachedFile && cachedFile.mtime === mtime) {
      // Reuse cached data
      newProjectCacheFiles[file] = cachedFile
      
      if (cachedFile.conditionals && cachedFile.conditionals.length > 0) {
        conditionals.push({ file, items: cachedFile.conditionals })
      }
      if (cachedFile.classes && cachedFile.classes.length > 0) {
        classes.push({ file, items: cachedFile.classes })
      }
      if (cachedFile.loops && cachedFile.loops.length > 0) {
        loops.push({ file, items: cachedFile.loops })
      }
      if (cachedFile.repeatLoops && cachedFile.repeatLoops.length > 0) {
        repeatLoops.push({ file, items: cachedFile.repeatLoops })
      }
      if (cachedFile.algorithms && cachedFile.algorithms.length > 0) {
        algorithms.push({ file, items: cachedFile.algorithms })
      }
      if (cachedFile.pythonStructures && cachedFile.pythonStructures.length > 0) {
        pythonStructures.push({ file, items: cachedFile.pythonStructures })
      }
      fileRawImports[file] = cachedFile.dependencies || []
    } else {
      // Parse file from scratch
      try {
        const content = await fs.readFile(fullFilePath, 'utf-8')

        const fileConds = parseConditionalsFromFile(file, content)
        if (fileConds.length > 0) conditionals.push({ file, items: fileConds })

        const fileClasses = parseClassesFromFile(file, content)
        if (fileClasses.length > 0) classes.push({ file, items: fileClasses })

        const fileLoops = parseLoopsFromFile(file, content)
        if (fileLoops.length > 0) loops.push({ file, items: fileLoops })

        const fileRepeats = parseRepeatLoopsFromFile(file, content)
        if (fileRepeats.length > 0) repeatLoops.push({ file, items: fileRepeats })

        const fileAlgos = parseAlgorithmsFromFile(file, content)
        if (fileAlgos.length > 0) algorithms.push({ file, items: fileAlgos })

        const filePy = parsePythonStructuresFromFile(file, content)
        if (filePy.length > 0) pythonStructures.push({ file, items: filePy })

        const rawImports = extractImports(content, ext)
        fileRawImports[file] = rawImports

        // Store to cache object
        newProjectCacheFiles[file] = {
          mtime,
          dependencies: rawImports,
          conditionals: fileConds,
          classes: fileClasses,
          loops: fileLoops,
          repeatLoops: fileRepeats,
          algorithms: fileAlgos,
          pythonStructures: filePy
        }
      } catch (e) {
        // Silently skip parse errors as per PM recommendation
      }
    }
  }

  // 5. Build Dependency Graph
  if (onProgress) {
    onProgress({ stage: 'parsing', message: 'Résolution des dépendances du projet...' })
  }
  const nodesMap = new Map<string, { id: string; type: 'file' | 'package' }>()
  for (const file of files) {
    nodesMap.set(file, { id: file, type: 'file' })
  }

  const links: Array<{ source: string; target: string; type: 'internal' | 'external' }> = []
  for (const file of Object.keys(fileRawImports)) {
    const ext = path.extname(file)
    const imports = fileRawImports[file]
    const targets = new Set<string>()

    for (const imp of imports) {
      if (ext === '.py') {
        const resolved = resolvePythonImport(file, imp, nodesMap)
        if (resolved) {
          targets.add(resolved)
        } else {
          targets.add(imp.split('.')[0])
        }
      } else {
        const resolved = resolveJsImport(file, imp, nodesMap)
        if (resolved) {
          targets.add(resolved)
        } else {
          let pkgName = imp
          if (imp.startsWith('@')) {
            const parts = imp.split('/')
            pkgName = parts.slice(0, 2).join('/')
          } else {
            pkgName = imp.split('/')[0]
          }
          targets.add(pkgName)
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

  const dependencies = {
    nodes: Array.from(nodesMap.values()),
    links
  }

  // 6. Git Analysis (Async)
  if (onProgress) {
    onProgress({ stage: 'git', message: 'Analyse des hotspots Git...' })
  }
  const git = await analyzeGit(resolvedPath, filesSet)

  // 7. Update Cache & Save
  if (onProgress) {
    onProgress({ stage: 'saving', message: 'Sauvegarde du cache global...' })
  }
  cache.projects[resolvedPath] = {
    lastScanned: Date.now(),
    files: newProjectCacheFiles,
    git: {
      hotspots: git.hotspots,
      is_git_repo: git.is_git
    }
  }
  await saveCache(cache)

  const scanResult = {
    structure,
    dependencies,
    git: {
      hotspots: git.hotspots,
      is_git_repo: git.is_git
    },
    conditionals,
    classes,
    loops,
    repeatLoops,
    algorithms,
    pythonStructures
  }

  if (onProgress) {
    onProgress({ stage: 'complete', message: 'Scan terminé avec succès !' })
  }

  return scanResult
}
