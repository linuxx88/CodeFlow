import path from 'path'

export function parseLoopsFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (ext === '.py') {
      const pyWhileMatch = line.match(/^\s*while\s+(.+):/)
      if (pyWhileMatch) {
        const condition = pyWhileMatch[1].trim()
        let bodyBlock = 'Répéter les instructions'
        
        let j = i + 1
        const bodyLines: string[] = []
        while (j < lines.length && (lines[j].trim() === '' || lines[j].match(/^\s+/))) {
          if (lines[j].trim() !== '') {
            bodyLines.push(lines[j].trim())
          }
          j++
        }
        if (bodyLines.length > 0) {
          bodyBlock = bodyLines.join('; ')
          if (bodyBlock.length > 80) bodyBlock = bodyBlock.substring(0, 80) + '...'
        }

        result.push({
          type: 'while',
          line: i + 1,
          condition,
          body: bodyBlock
        })
      }
    } else {
      const whileMatch = line.match(/\bwhile\s*\((.+)\)/)
      if (whileMatch) {
        const condition = whileMatch[1].trim()
        let bodyBlock = 'Répéter les instructions'

        let hasBrace = line.includes('{')
        let j = i + 1
        if (!hasBrace && j < lines.length && lines[j].includes('{')) {
          hasBrace = true
          j++
        }

        if (hasBrace) {
          let braceCount = 1
          const bodyLines: string[] = []
          while (j < lines.length && braceCount > 0) {
            const l = lines[j]
            const openMatches = l.match(/\{/g)
            const closeMatches = l.match(/\}/g)
            braceCount += openMatches ? openMatches.length : 0
            braceCount -= closeMatches ? closeMatches.length : 0
            if (braceCount > 0 && l.trim() !== '') {
              bodyLines.push(l.trim())
            }
            j++
          }
          if (bodyLines.length > 0) {
            bodyBlock = bodyLines.join(' ')
            if (bodyBlock.length > 80) bodyBlock = bodyBlock.substring(0, 80) + '...'
          }
        } else {
          if (j < lines.length && lines[j].trim() !== '') {
            bodyBlock = lines[j].trim()
          }
        }

        result.push({
          type: 'while',
          line: i + 1,
          condition,
          body: bodyBlock
        })
      }
    }
  }

  return result
}

export function parseRepeatLoopsFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (ext !== '.py') {
      const doMatch = line.match(/\bdo\s*\{/)
      if (doMatch) {
        let bodyBlock = 'Répéter les instructions'
        let condition = 'true'
        let braceCount = 1
        let j = i + 1
        const bodyLines: string[] = []
        
        while (j < lines.length && braceCount > 0) {
          const l = lines[j]
          const openMatches = l.match(/\{/g)
          const closeMatches = l.match(/\}/g)
          braceCount += openMatches ? openMatches.length : 0
          braceCount -= closeMatches ? closeMatches.length : 0
          if (braceCount > 0 && l.trim() !== '') {
            bodyLines.push(l.trim())
          }
          j++
        }
        
        if (bodyLines.length > 0) {
          bodyBlock = bodyLines.join(' ')
          if (bodyBlock.length > 80) bodyBlock = bodyBlock.substring(0, 80) + '...'
        }
        
        if (j < lines.length) {
          const nextLines = lines.slice(j - 1, j + 2).join(' ')
          const whileMatch = nextLines.match(/\bwhile\s*\(([^)]+)\)/)
          if (whileMatch) {
            condition = whileMatch[1].trim()
          }
        }

        result.push({
          type: 'repeat',
          line: i + 1,
          condition,
          body: bodyBlock
        })
      }
    }
  }

  return result
}
