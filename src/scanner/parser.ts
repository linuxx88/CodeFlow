import { parseConditionalsFromFile as originalParseConditionals } from './parsers/conditionalParser'
import { parseClassesFromFile as originalParseClasses } from './parsers/classParser'
import { parseLoopsFromFile as originalParseLoops, parseRepeatLoopsFromFile as originalParseRepeatLoops } from './parsers/loopParser'
import { parseAlgorithmsFromFile as originalParseAlgorithms } from './parsers/algorithmParser'
import { parsePythonStructuresFromFile as originalParsePythonStructures } from './parsers/pythonParser'
import path from 'path'

const isSupportedExt = (ext: string): boolean => {
  return ['.py', '.js', '.ts', '.jsx', '.tsx'].includes(ext.toLowerCase())
}

export function parseConditionalsFromFile(file: string, content: string): any[] {
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
}

export function parseClassesFromFile(file: string, content: string): any[] {
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
}

export function parseLoopsFromFile(file: string, content: string): any[] {
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
}

export function parseRepeatLoopsFromFile(file: string, content: string): any[] {
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
}

export function parseAlgorithmsFromFile(file: string, content: string): any[] {
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
}

export function parsePythonStructuresFromFile(file: string, content: string): any[] {
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
}

