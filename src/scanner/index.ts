import fs from 'fs'
import path from 'path'
import { scanDir, getAllFiles } from './fileScanner'
import { analyzeGit } from './gitAnalyzer'
import {
  parseDependencies,
  parseConditionalsFromFile,
  parseClassesFromFile,
  parseLoopsFromFile,
  parseRepeatLoopsFromFile,
  parseAlgorithmsFromFile,
  parsePythonStructuresFromFile
} from './parser'

export function handleScan(projectPath: string) {
  const resolvedPath = path.resolve(projectPath)
  if (!fs.existsSync(resolvedPath)) {
    throw new Error('Project path does not exist: ' + resolvedPath)
  }
  
  const structure = scanDir(resolvedPath, resolvedPath)
  const files = getAllFiles(resolvedPath, resolvedPath)
  const dependencies = parseDependencies(files, resolvedPath)
  const git = analyzeGit(resolvedPath)

  const conditionals: any[] = []
  const classes: any[] = []
  const loops: any[] = []
  const repeatLoops: any[] = []
  const algorithms: any[] = []
  const pythonStructures: any[] = []
  
  for (const file of files) {
    const ext = path.extname(file)
    if (ext === '.py' || ext === '.js' || ext === '.ts' || ext === '.jsx' || ext === '.tsx') {
      try {
        const content = fs.readFileSync(path.join(resolvedPath, file), 'utf-8')
        
        const fileConds = parseConditionalsFromFile(file, content)
        if (fileConds.length > 0) {
          conditionals.push({
            file,
            items: fileConds
          })
        }

        const fileClasses = parseClassesFromFile(file, content)
        if (fileClasses.length > 0) {
          classes.push({
            file,
            items: fileClasses
          })
        }

        const fileLoops = parseLoopsFromFile(file, content)
        if (fileLoops.length > 0) {
          loops.push({
            file,
            items: fileLoops
          })
        }

        const fileRepeats = parseRepeatLoopsFromFile(file, content)
        if (fileRepeats.length > 0) {
          repeatLoops.push({
            file,
            items: fileRepeats
          })
        }

        const fileAlgos = parseAlgorithmsFromFile(file, content)
        if (fileAlgos.length > 0) {
          algorithms.push({
            file,
            items: fileAlgos
          })
        }

        const filePy = parsePythonStructuresFromFile(file, content)
        if (filePy.length > 0) {
          pythonStructures.push({
            file,
            items: filePy
          })
        }
      } catch (e) {}
    }
  }
  
  return {
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
}
