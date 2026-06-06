import path from 'path'

export function parseConditionalsFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (ext === '.py') {
      const pyIfMatch = line.match(/^\s*if\s+(.+):/)
      if (pyIfMatch) {
        const condition = pyIfMatch[1].trim()
        let thenBlock = ''
        let elseBlock = ''
        
        let j = i + 1
        const thenLines: string[] = []
        while (j < lines.length && (lines[j].trim() === '' || lines[j].match(/^\s+/))) {
          if (lines[j].trim() !== '') {
            thenLines.push(lines[j].trim())
          }
          j++
        }
        if (thenLines.length > 0) {
          thenBlock = thenLines.join('; ')
          if (thenBlock.length > 80) thenBlock = thenBlock.substring(0, 80) + '...'
        }

        if (j < lines.length && lines[j].match(/^\s*else\s*:/)) {
          let k = j + 1
          const elseLines: string[] = []
          while (k < lines.length && (lines[k].trim() === '' || lines[k].match(/^\s+/))) {
            if (lines[k].trim() !== '') {
              elseLines.push(lines[k].trim())
            }
            k++
          }
          if (elseLines.length > 0) {
            elseBlock = elseLines.join('; ')
            if (elseBlock.length > 80) elseBlock = elseBlock.substring(0, 80) + '...'
          }
        }

        result.push({
          type: 'ifelse',
          line: i + 1,
          condition,
          then: thenBlock,
          else: elseBlock || null
        })
      }
    } else {
      const ifMatch = line.match(/\bif\s*\((.+)\)/)
      if (ifMatch) {
        const condition = ifMatch[1].trim()
        let thenBlock = ''
        let elseBlock = ''

        let hasBrace = line.includes('{')
        let j = i + 1
        if (!hasBrace && j < lines.length && lines[j].includes('{')) {
          hasBrace = true
          j++
        }

        if (hasBrace) {
          let braceCount = 1
          const thenLines: string[] = []
          while (j < lines.length && braceCount > 0) {
            const l = lines[j]
            const openMatches = l.match(/\{/g)
            const closeMatches = l.match(/\}/g)
            braceCount += openMatches ? openMatches.length : 0
            braceCount -= closeMatches ? closeMatches.length : 0
            if (braceCount > 0 && l.trim() !== '') {
              thenLines.push(l.trim())
            }
            j++
          }
          if (thenLines.length > 0) {
            thenBlock = thenLines.join(' ')
            if (thenBlock.length > 80) thenBlock = thenBlock.substring(0, 80) + '...'
          }

          const nextLines = lines.slice(j, j + 3).join(' ')
          if (nextLines.includes('else')) {
            let elseBrace = nextLines.includes('{')
            let k = j
            while (k < lines.length && !lines[k].includes('else')) {
              k++
            }
            if (k < lines.length) {
              if (lines[k].includes('{')) elseBrace = true
              let m = k + 1
              if (!elseBrace && m < lines.length && lines[m].includes('{')) {
                elseBrace = true
                m++
              }
              if (elseBrace) {
                let eBraceCount = 1
                const elseLines: string[] = []
                while (m < lines.length && eBraceCount > 0) {
                  const l = lines[m]
                  const openMatches = l.match(/\{/g)
                  const closeMatches = l.match(/\}/g)
                  eBraceCount += openMatches ? openMatches.length : 0
                  eBraceCount -= closeMatches ? closeMatches.length : 0
                  if (eBraceCount > 0 && l.trim() !== '') {
                    elseLines.push(l.trim())
                  }
                  m++
                }
                if (elseLines.length > 0) {
                  elseBlock = elseLines.join(' ')
                  if (elseBlock.length > 80) elseBlock = elseBlock.substring(0, 80) + '...'
                }
              } else {
                if (m < lines.length && lines[m].trim() !== '') {
                  elseBlock = lines[m].trim()
                }
              }
            }
          }
        } else {
          if (j < lines.length && lines[j].trim() !== '') {
            thenBlock = lines[j].trim()
          }
        }

        result.push({
          type: 'ifelse',
          line: i + 1,
          condition,
          then: thenBlock,
          else: elseBlock || null
        })
      }

      const switchMatch = line.match(/\bswitch\s*\((.+)\)/)
      if (switchMatch) {
        const expression = switchMatch[1].trim()
        const cases: string[] = []
        let j = i + 1
        while (j < lines.length) {
          const l = lines[j]
          if (l.includes('switch') || l.includes('function') || l.includes('class')) break
          const caseMatch = l.match(/\bcase\s+([^:]+):/)
          if (caseMatch) {
            cases.push(caseMatch[1].trim())
          }
          const defaultMatch = l.match(/\bdefault\s*:/)
          if (defaultMatch) {
            cases.push('default')
          }
          if (l.includes('}') && !l.includes('{')) {
            break
          }
          j++
        }
        if (cases.length > 0) {
          result.push({
            type: 'switch',
            line: i + 1,
            expression,
            cases
          })
        }
      }
    }
  }

  const validatedResult: any[] = []
  for (const item of result) {
    if (!item || typeof item !== 'object') continue
    if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) continue

    if (item.type === 'ifelse') {
      if (
        typeof item.condition === 'string' &&
        item.condition.trim().length > 0 &&
        typeof item.then === 'string' &&
        item.then.trim().length > 0 &&
        (item.else === null || (typeof item.else === 'string' && item.else.trim().length > 0))
      ) {
        validatedResult.push({
          type: 'ifelse',
          line: item.line,
          condition: item.condition.trim(),
          then: item.then.trim(),
          else: item.else ? item.else.trim() : null
        })
      }
    } else if (item.type === 'switch') {
      if (
        typeof item.expression === 'string' &&
        item.expression.trim().length > 0 &&
        Array.isArray(item.cases) &&
        item.cases.length > 0
      ) {
        const cleanCases = item.cases
          .map((c: any) => typeof c === 'string' ? c.trim() : '')
          .filter((c: string) => c.length > 0)
        
        if (cleanCases.length > 0) {
          validatedResult.push({
            type: 'switch',
            line: item.line,
            expression: item.expression.trim(),
            cases: cleanCases
          })
        }
      }
    }
  }

  return validatedResult
}
