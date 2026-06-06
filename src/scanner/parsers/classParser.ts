import path from 'path'

export function parseClassesFromFile(file: string, content: string): any[] {
  const result: any[] = []
  const lines = content.split('\n')
  const ext = path.extname(file)

  let currentClass: any = null
  let braceCount = 0
  let classBraceStart = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (ext === '.py') {
      const classMatch = line.match(/^\s*class\s+([\w_]+)(?:\(([\w_.]+)\))?\s*:/)
      if (classMatch) {
        if (currentClass) {
          result.push(currentClass)
        }
        currentClass = {
          name: classMatch[1],
          inherits: classMatch[2] || null,
          properties: [],
          methods: [],
          line: i + 1
        }
      } else if (currentClass) {
        const indentMatch = line.match(/^(\s+)/)
        if (indentMatch && indentMatch[1].length > 0) {
          const trimmed = line.trim()
          if (trimmed.startsWith('def ')) {
            const methodMatch = trimmed.match(/^def\s+([\w_]+)\(/)
            if (methodMatch) {
              const mName = methodMatch[1]
              if (mName !== '__init__') {
                currentClass.methods.push(mName)
              }
            }
          } else {
            const selfMatch = trimmed.match(/^self\.([\w_]+)\s*=/)
            if (selfMatch) {
              const prop = selfMatch[1]
              if (!currentClass.properties.includes(prop)) {
                currentClass.properties.push(prop)
              }
            }
          }
        } else if (line.trim() !== '' && !line.trim().startsWith('#')) {
          result.push(currentClass)
          currentClass = null
        }
      }
    } else {
      const classMatch = line.match(/\bclass\s+([\w_]+)(?:\s+extends\s+([\w_]+))?\b/)
      if (classMatch) {
        if (currentClass) {
          result.push(currentClass)
        }
        currentClass = {
          name: classMatch[1],
          inherits: classMatch[2] || null,
          properties: [],
          methods: [],
          line: i + 1
        }
        braceCount = 0
        if (line.includes('{')) {
          braceCount = 1
          classBraceStart = i
        } else {
          classBraceStart = -1
        }
      } else if (currentClass) {
        if (classBraceStart === -1 && line.includes('{')) {
          braceCount = 1
          classBraceStart = i
        } else if (classBraceStart !== -1) {
          const openMatches = line.match(/\{/g)
          const closeMatches = line.match(/\}/g)
          braceCount += openMatches ? openMatches.length : 0
          braceCount -= closeMatches ? closeMatches.length : 0

          if (braceCount <= 0) {
            result.push(currentClass)
            currentClass = null
            continue
          }

          const trimmed = line.trim()
          if (trimmed.startsWith('constructor') || trimmed.startsWith('public ') || trimmed.startsWith('private ') || trimmed.startsWith('protected ') || trimmed.match(/^[\w_]+\s*\(/)) {
            const methodMatch = trimmed.match(/^(?:public\s+|private\s+|protected\s+)?(async\s+)?([\w_]+)\s*\(/)
            if (methodMatch) {
              const mName = methodMatch[2]
              if (mName !== 'constructor' && !currentClass.methods.includes(mName)) {
                currentClass.methods.push(mName)
              }
            }
          } else {
            const propMatch = trimmed.match(/^(?:public\s+|private\s+|protected\s+)?(?:readonly\s+)?([\w_]+)\s*(?::|=)/)
            if (propMatch) {
              const pName = propMatch[1]
              if (!currentClass.properties.includes(pName)) {
                currentClass.properties.push(pName)
              }
            }
          }
        }
      }
    }
  }
  if (currentClass) {
    result.push(currentClass)
  }
  return result
}
