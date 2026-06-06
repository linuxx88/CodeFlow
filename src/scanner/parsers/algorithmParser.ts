import path from 'path'

export function parseAlgorithmsFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (ext === '.py') {
      const pyFuncMatch = line.match(/^\s*def\s+([\w_]+)\(([^)]*)\)\s*:/)
      if (pyFuncMatch) {
        const name = pyFuncMatch[1]
        const args = pyFuncMatch[2].trim()
        const steps: string[] = []
        
        let j = i + 1
        while (j < lines.length && (lines[j].trim() === '' || lines[j].match(/^\s+/))) {
          const trimmed = lines[j].trim()
          if (trimmed !== '' && !trimmed.startsWith('#')) {
            steps.push(trimmed)
          }
          j++
        }

        result.push({
          name,
          args,
          steps: steps.slice(0, 10),
          line: i + 1
        })
      }
    } else {
      const jsFuncMatch = line.match(/(?:function\s+([\w_]+)|const\s+([\w_]+)\s*=\s*(?:\([^)]*\)|[\w_]+)\s*=>|\b([\w_]+)\s*\([^)]*\)\s*\{)/)
      if (jsFuncMatch) {
        const name = jsFuncMatch[1] || jsFuncMatch[2] || jsFuncMatch[3]
        if (!name || name === 'if' || name === 'while' || name === 'switch' || name === 'for') continue

        let hasBrace = line.includes('{')
        let j = i + 1
        if (!hasBrace && j < lines.length && lines[j].includes('{')) {
          hasBrace = true
          j++
        }

        if (hasBrace) {
          let braceCount = 1
          const steps: string[] = []
          while (j < lines.length && braceCount > 0) {
            const l = lines[j]
            const openMatches = l.match(/\{/g)
            const closeMatches = l.match(/\}/g)
            braceCount += openMatches ? openMatches.length : 0
            braceCount -= closeMatches ? closeMatches.length : 0
            
            const trimmed = l.trim()
            if (braceCount > 0 && trimmed !== '' && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
              steps.push(trimmed)
            }
            j++
          }

          result.push({
            name,
            args: '',
            steps: steps.filter(s => s.length > 2).slice(0, 8),
            line: i + 1
          })
        }
      }
    }
  }

  const validatedResult: any[] = []
  for (const item of result) {
    if (!item || typeof item !== 'object') continue
    if (typeof item.name !== 'string' || item.name.trim().length === 0) continue
    if (typeof item.args !== 'string') continue
    if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) continue
    if (!Array.isArray(item.steps)) continue

    const cleanSteps = item.steps.filter((step: any) => {
      if (typeof step !== 'string') return false
      const s = step.trim()
      if (s.length <= 2) return false
      if (s.startsWith('#') || s.startsWith('//') || s.startsWith('*') || s.startsWith('/*')) return false
      if (/^[{}()\[\]\s;,]+$/.test(s)) return false

      const lower = s.toLowerCase()
      if (
        lower === 'else' || lower === 'else:' ||
        lower === 'try' || lower === 'try:' ||
        lower === 'finally' || lower === 'finally:' ||
        lower === 'except' || lower === 'except:' ||
        lower === 'do' || lower === 'do {'
      ) {
        return false
      }
      return true
    })

    if (cleanSteps.length > 0) {
      validatedResult.push({
        name: item.name,
        args: item.args,
        steps: cleanSteps,
        line: item.line
      })
    }
  }

  return validatedResult
}
