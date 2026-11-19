import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execPromise = promisify(exec)

export type GitFileStatus = 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'unmerged'

export interface GitHotspot {
  file: string
  commits: number
  authors: number
  score: number
  hasConflicts: boolean
}

function parsePorcelainStatus(code: string): GitFileStatus | null {
  if (code === '??') return 'untracked'
  if (code === 'AA' || code === 'DD' || code.includes('U')) return 'unmerged'
  if (code.includes('M')) return 'modified'
  if (code.includes('A')) return 'added'
  if (code.includes('D')) return 'deleted'
  if (code.includes('R')) return 'renamed'
  return null
}

export async function analyzeGit(rootPath: string, existingFiles: Set<string>) {
  try {
    await execPromise('git rev-parse --is-inside-work-tree', { cwd: rootPath })
  } catch {
    return { hotspots: [] as GitHotspot[], statuses: {} as Record<string, GitFileStatus>, is_git: false }
  }

  const statuses: Record<string, GitFileStatus> = {}
  try {
    const { stdout: statusOutput } = await execPromise(
      'git status --porcelain',
      { cwd: rootPath }
    )
    const statusLines = statusOutput.split(/\r?\n/)
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
        file = file.replace(/\\/g, '/')

        const status = parsePorcelainStatus(code)
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
    const lines = logOutput.split(/\r?\n/)
    for (const line of lines) {
      if (line.startsWith('COMMIT:')) {
        currentAuthor = line.substring(7).trim()
      } else if (line.trim()) {
        const file = line.trim().replace(/\\/g, '/')
        if (existingFiles.has(file)) {
          fileCommits.set(file, (fileCommits.get(file) || 0) + 1)
          if (!fileAuthors.has(file)) fileAuthors.set(file, new Set())
          if (currentAuthor) fileAuthors.get(file)!.add(currentAuthor)
        }
      }
    }

    const hotspots: GitHotspot[] = []
    for (const [file, commits] of fileCommits.entries()) {
      const authors = fileAuthors.get(file)?.size || 0

      let hasConflicts = false
      if (statuses[file] === 'unmerged') {
        hasConflicts = true
      } else {
        try {
          const fullPath = path.join(rootPath, file)
          const content = await fs.readFile(fullPath, 'utf8')
          hasConflicts = content.includes('<<<<<<<') && content.includes('=======') && content.includes('>>>>>>>')
        } catch {
          // ignore unreadable/deleted files
        }
      }

      hotspots.push({
        file,
        commits,
        authors,
        score: commits * authors,
        hasConflicts
      })
    }

    return { hotspots, statuses, is_git: true }
  } catch {
    // Repo may have no commits yet; it is still a git repository
    return { hotspots: [] as GitHotspot[], statuses, is_git: true }
  }
}
