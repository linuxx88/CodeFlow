import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export function analyzeGit(rootPath: string) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: rootPath, stdio: 'ignore' })
  } catch (e) {
    return { hotspots: [], is_git: false }
  }
  
  try {
    const logOutput = execSync(
      'git log --name-only --pretty=format:"COMMIT:%ae"',
      { cwd: rootPath, encoding: 'utf-8' }
    )
    
    const fileCommits = new Map<string, number>()
    const fileAuthors = new Map<string, Set<string>>()
    
    let currentAuthor = ''
    const lines = logOutput.split('\n')
    for (const line of lines) {
      if (line.startsWith('COMMIT:')) {
        currentAuthor = line.substring(7)
      } else if (line.trim()) {
        const file = line.trim()
        if (fs.existsSync(path.join(rootPath, file))) {
          fileCommits.set(file, (fileCommits.get(file) || 0) + 1)
          if (!fileAuthors.has(file)) fileAuthors.set(file, new Set())
          if (currentAuthor) fileAuthors.get(file)!.add(currentAuthor)
        }
      }
    }
    
    const hotspots: any[] = []
    for (const [file, commits] of fileCommits.entries()) {
      const authors = fileAuthors.get(file)?.size || 0
      hotspots.push({
        file,
        commits,
        authors,
        score: commits * authors
      })
    }
    
    return { hotspots, is_git: true }
  } catch (e) {
    return { hotspots: [], is_git: false }
  }
}
