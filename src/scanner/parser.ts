import { parseConditionalsFromFile as originalParseConditionals } from './parsers/conditionalParser'
import { parseClassesFromFile as originalParseClasses } from './parsers/classParser'
import { parseLoopsFromFile as originalParseLoops, parseRepeatLoopsFromFile as originalParseRepeatLoops } from './parsers/loopParser'
import { parseAlgorithmsFromFile as originalParseAlgorithms } from './parsers/algorithmParser'
import { parsePythonStructuresFromFile as originalParsePythonStructures } from './parsers/pythonParser'
import path from 'path'

const isSupportedExt = (ext: string): boolean => {
  return ['.py', '.js', '.ts', '.jsx', '.tsx'].includes(ext.toLowerCase())
}

export interface ParserStrategy {
  id: string
  supports(file: string): boolean
  parse(file: string, content: string): any[]
}

export class ParserRegistry {
  private static strategies: ParserStrategy[] = []

  static register(strategy: ParserStrategy): void {
    if (!this.strategies.some((s) => s.id === strategy.id)) {
      this.strategies.push(strategy)
    }
  }

  static getParsersForFile(file: string): ParserStrategy[] {
    return this.strategies.filter((s) => s.supports(file))
  }

  static getParser(id: string): ParserStrategy | undefined {
    return this.strategies.find((s) => s.id === id)
  }

  static clear(): void {
    this.strategies = []
  }
}

// 1. Conditionals Strategy
ParserRegistry.register({
  id: 'conditionals',
  supports(file: string): boolean {
    return isSupportedExt(path.extname(file))
  },
  parse(file: string, content: string): any[] {
    try {
      const ext = path.extname(file).toLowerCase()
      if (!isSupportedExt(ext)) return []

      const raw = originalParseConditionals(file, content)
      if (!Array.isArray(raw)) return []

      return raw.filter((item) => {
        if (!item || typeof item !== 'object') return false
        if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) return false

        if (item.type === 'ifelse') {
          return (
            typeof item.condition === 'string' &&
            item.condition.trim().length > 0 &&
            typeof item.then === 'string' &&
            item.then.trim().length > 0 &&
            (item.else === null || typeof item.else === 'string')
          )
        } else if (item.type === 'switch') {
          return (
            typeof item.expression === 'string' &&
            item.expression.trim().length > 0 &&
            Array.isArray(item.cases) &&
            item.cases.length > 0 &&
            item.cases.every((c: any) => typeof c === 'string' && c.trim().length > 0)
          )
        }
        return false
      })
    } catch (e) {
      return []
    }
  }
})

// 2. Classes Strategy
ParserRegistry.register({
  id: 'classes',
  supports(file: string): boolean {
    return isSupportedExt(path.extname(file))
  },
  parse(file: string, content: string): any[] {
    try {
      const ext = path.extname(file).toLowerCase()
      if (!isSupportedExt(ext)) return []

      const raw = originalParseClasses(file, content)
      if (!Array.isArray(raw)) return []

      return raw.filter((item) => {
        if (!item || typeof item !== 'object') return false
        if (typeof item.name !== 'string' || item.name.trim().length === 0) return false
        if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) return false
        if (item.inherits !== null && typeof item.inherits !== 'string') return false
        if (!Array.isArray(item.properties) || !item.properties.every((p: any) => typeof p === 'string')) return false
        if (!Array.isArray(item.methods) || !item.methods.every((m: any) => typeof m === 'string')) return false
        return true
      })
    } catch (e) {
      return []
    }
  }
})

// 3. Loops Strategy
ParserRegistry.register({
  id: 'loops',
  supports(file: string): boolean {
    return isSupportedExt(path.extname(file))
  },
  parse(file: string, content: string): any[] {
    try {
      const ext = path.extname(file).toLowerCase()
      if (!isSupportedExt(ext)) return []

      const raw = originalParseLoops(file, content)
      if (!Array.isArray(raw)) return []

      return raw.filter((item) => {
        if (!item || typeof item !== 'object') return false
        if (item.type !== 'while') return false
        if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) return false
        if (typeof item.condition !== 'string' || item.condition.trim().length === 0) return false
        if (typeof item.body !== 'string' || item.body.trim().length === 0) return false
        return true
      })
    } catch (e) {
      return []
    }
  }
})

// 4. Repeat Loops Strategy
ParserRegistry.register({
  id: 'repeatLoops',
  supports(file: string): boolean {
    return isSupportedExt(path.extname(file))
  },
  parse(file: string, content: string): any[] {
    try {
      const ext = path.extname(file).toLowerCase()
      if (!isSupportedExt(ext)) return []

      const raw = originalParseRepeatLoops(file, content)
      if (!Array.isArray(raw)) return []

      return raw.filter((item) => {
        if (!item || typeof item !== 'object') return false
        if (item.type !== 'repeat') return false
        if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) return false
        if (typeof item.condition !== 'string' || item.condition.trim().length === 0) return false
        if (typeof item.body !== 'string' || item.body.trim().length === 0) return false
        return true
      })
    } catch (e) {
      return []
    }
  }
})

// 5. Algorithms Strategy
ParserRegistry.register({
  id: 'algorithms',
  supports(file: string): boolean {
    return isSupportedExt(path.extname(file))
  },
  parse(file: string, content: string): any[] {
    try {
      const ext = path.extname(file).toLowerCase()
      if (!isSupportedExt(ext)) return []

      const raw = originalParseAlgorithms(file, content)
      if (!Array.isArray(raw)) return []

      return raw.filter((item) => {
        if (!item || typeof item !== 'object') return false
        if (typeof item.name !== 'string' || item.name.trim().length === 0) return false
        if (typeof item.args !== 'string') return false
        if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) return false
        if (!Array.isArray(item.steps) || !item.steps.every((s: any) => typeof s === 'string')) return false
        return true
      })
    } catch (e) {
      return []
    }
  }
})

// 6. Python Structures Strategy
ParserRegistry.register({
  id: 'pythonStructures',
  supports(file: string): boolean {
    return path.extname(file).toLowerCase() === '.py'
  },
  parse(file: string, content: string): any[] {
    try {
      const ext = path.extname(file).toLowerCase()
      if (ext !== '.py') return []

      const raw = originalParsePythonStructures(file, content)
      if (!Array.isArray(raw)) return []

      return raw.filter((item) => {
        if (!item || typeof item !== 'object') return false
        if (typeof item.line !== 'number' || isNaN(item.line) || item.line <= 0) return false

        if (item.type === 'tryexcept') {
          return (
            typeof item.try === 'string' &&
            item.try.trim().length > 0 &&
            typeof item.except === 'string' &&
            item.except.trim().length > 0
          )
        } else if (item.type === 'decorator') {
          return typeof item.name === 'string' && item.name.trim().length > 0
        } else if (item.type === 'main') {
          return typeof item.label === 'string' && item.label.trim().length > 0
        }
        return false
      })
    } catch (e) {
      return []
    }
  }
})

// Legacy wrapper functions for backward compatibility
export function parseConditionalsFromFile(file: string, content: string): any[] {
  const parser = ParserRegistry.getParser('conditionals')
  return parser ? parser.parse(file, content) : []
}

export function parseClassesFromFile(file: string, content: string): any[] {
  const parser = ParserRegistry.getParser('classes')
  return parser ? parser.parse(file, content) : []
}

export function parseLoopsFromFile(file: string, content: string): any[] {
  const parser = ParserRegistry.getParser('loops')
  return parser ? parser.parse(file, content) : []
}

export function parseRepeatLoopsFromFile(file: string, content: string): any[] {
  const parser = ParserRegistry.getParser('repeatLoops')
  return parser ? parser.parse(file, content) : []
}

export function parseAlgorithmsFromFile(file: string, content: string): any[] {
  const parser = ParserRegistry.getParser('algorithms')
  return parser ? parser.parse(file, content) : []
}

export function parsePythonStructuresFromFile(file: string, content: string): any[] {
  const parser = ParserRegistry.getParser('pythonStructures')
  return parser ? parser.parse(file, content) : []
}
