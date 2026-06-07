import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

export async function analyzeGit(rootPath: string, existingFiles: Set<string>) {
  try {
    await execPromise('git rev-parse --is-inside-work-tree', { cwd: rootPath })
  } catch (e) {
    return { hotspots: [], statuses: {}, is_git: false }
  }
  
  const statuses: Record<string, 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'unmerged'> = {}
  try {
    const { stdout: statusOutput } = await execPromise(
      'git status --porcelain',
      { cwd: rootPath }
    )
    const statusLines = statusOutput.split('\n')
    for (const line of statusLines) {
      if (line.length > 3) {
        const code = line.substring(0, 2)
        let file = line.substring(3).trim()
        
        if (file.includes(' -> ')) {
          const parts = file.split(' -> ')
          file = parts[parts.length - 1].trim()
        }
        if (file.startsWith('"') && file.endsWith('"')) {
          file = file.slice(1, -1)
        }
        
        let status: 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'unmerged' | null = null
        if (code === '??') {
          status = 'untracked'
        } else if (code.includes('M')) {
          status = 'modified'
        } else if (code.includes('A')) {
          status = 'added'
        } else if (code.includes('D')) {
          status = 'deleted'
        } else if (code.includes('R')) {
          status = 'renamed'
        } else if (code.includes('U')) {
          status = 'unmerged'
        }
        
        if (status) {
          statuses[file] = status
        }
      }
    }
  } catch (e) {
    console.error('Error running git status:', e)
  }
  
  try {
    const { stdout: logOutput } = await execPromise(
      'git log --name-only --pretty=format:"COMMIT:%ae"',
      { cwd: rootPath, maxBuffer: 10 * 1024 * 1024 }
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
        if (existingFiles.has(file)) {
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
    
    return { hotspots, statuses, is_git: true }
  } catch (e) {
    return { hotspots: [], statuses, is_git: false }
  }
}
