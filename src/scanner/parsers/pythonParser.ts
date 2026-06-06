import path from 'path'

export function parsePythonStructuresFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  if (ext !== '.py') return result

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.match(/^\s*try\s*:/)) {
      let j = i + 1
      let tryBlock = ''
      while (j < lines.length && (lines[j].trim() === '' || lines[j].match(/^\s+/))) {
        if (lines[j].trim() !== '') {
          tryBlock = lines[j].trim()
          break
        }
        j++
      }
      
      let exceptCond = ''
      while (j < lines.length && !lines[j].match(/^\s*except/)) {
        j++
      }
      if (j < lines.length) {
        const exceptMatch = lines[j].match(/^\s*except\s*([^:]*):/)
        if (exceptMatch && exceptMatch[1].trim()) {
          exceptCond = exceptMatch[1].trim()
        }
      }

      if (tryBlock.trim() !== '' && exceptCond.trim() !== '') {
        result.push({
          type: 'tryexcept',
          line: i + 1,
          try: tryBlock.trim(),
          except: exceptCond.trim()
        })
      }
    }

    const decMatch = line.match(/^\s*@([\w_.]+)/)
    if (decMatch) {
      result.push({
        type: 'decorator',
        line: i + 1,
        name: decMatch[1]
      })
    }

    if (line.match(/^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/)) {
      result.push({
        type: 'main',
        line: i + 1,
        label: 'if __name__ == "__main__"'
      })
    }
  }

  const validatedResult: any[] = []
  for (const item of result) {
    if (!item || typeof item !== 'object') continue
    if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) continue

    if (item.type === 'tryexcept') {
      if (
        typeof item.try === 'string' &&
        item.try.trim().length > 0 &&
        typeof item.except === 'string' &&
        item.except.trim().length > 0
      ) {
        validatedResult.push(item)
      }
    } else if (item.type === 'decorator') {
      if (typeof item.name === 'string' && item.name.trim().length > 0) {
        validatedResult.push(item)
      }
    } else if (item.type === 'main') {
      if (typeof item.label === 'string' && item.label.trim().length > 0) {
        validatedResult.push(item)
      }
    }
  }

  return validatedResult
}
