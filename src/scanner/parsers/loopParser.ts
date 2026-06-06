import path from 'path'

function hasSyntaxErrors(str: string): boolean {
  const stack: string[] = []
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{'
  }
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
    } else if (char === ')' || char === ']' || char === '}') {
      if (stack.pop() !== pairs[char]) {
        return true
      }
    }
  }
  return stack.length !== 0
}

export function parseLoopsFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    try {
      if (ext === '.py') {
        const pyWhileMatch = line.match(/^\s*while\s+(.+):/)
        if (pyWhileMatch) {
          const condition = pyWhileMatch[1].trim()
          let bodyBlock = 'Répéter les instructions'
          
          const baseIndent = (line.match(/^(\s*)/)?.[1] || '').length
          let j = i + 1
          const bodyLines: string[] = []
          while (j < lines.length) {
            const nextLine = lines[j]
            const trimmed = nextLine.trim()
            if (trimmed === '') {
              j++
              continue
            }
            const nextIndent = (nextLine.match(/^(\s*)/)?.[1] || '').length
            if (nextIndent <= baseIndent) {
              break
            }
            bodyLines.push(trimmed)
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
        const whileMatch = line.match(/^\s*while\s*\((.+)\)/)
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
    } catch (e) {
      // Prevent syntax processing exceptions
    }
  }

  // Rigorous schema boundary validation
  const validatedResult: any[] = []
  for (const item of result) {
    if (!item || typeof item !== 'object') continue
    if (item.type !== 'while') continue
    if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) continue
    if (typeof item.condition !== 'string' || item.condition.trim().length === 0) continue
    if (typeof item.body !== 'string' || item.body.trim().length === 0) continue

    const cond = item.condition.trim()
    if (hasSyntaxErrors(cond)) continue

    validatedResult.push({
      type: 'while',
      line: item.line,
      condition: cond,
      body: item.body.trim()
    })
  }

  return validatedResult
}

export function parseRepeatLoopsFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    try {
      if (ext !== '.py') {
        const doMatch = line.match(/^\s*do\s*\{/)
        if (doMatch) {
          let bodyBlock = 'Répéter les instructions'
          let condition = ''
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

          if (condition) {
            result.push({
              type: 'repeat',
              line: i + 1,
              condition,
              body: bodyBlock
            })
          }
        }
      }
    } catch (e) {
      // Prevent syntax processing exceptions
    }
  }

  // Rigorous schema boundary validation
  const validatedResult: any[] = []
  for (const item of result) {
    if (!item || typeof item !== 'object') continue
    if (item.type !== 'repeat') continue
    if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) continue
    if (typeof item.condition !== 'string' || item.condition.trim().length === 0) continue
    if (typeof item.body !== 'string' || item.body.trim().length === 0) continue

    const cond = item.condition.trim()
    if (hasSyntaxErrors(cond)) continue

    validatedResult.push({
      type: 'repeat',
      line: item.line,
      condition: cond,
      body: item.body.trim()
    })
  }

  return validatedResult
}
