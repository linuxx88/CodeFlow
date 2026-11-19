import { describe, it, expect } from 'vitest'
import { resolvePythonImport, resolveJsImport } from './dependencyParser'

describe('dependencyParser', () => {
  describe('resolvePythonImport', () => {
    it('should resolve relative and parent-directory Python imports', () => {
      const nodes = new Map([
        ['pkg/sub/mod.py', {}],
        ['pkg/sub/helper.py', {}],
        ['pkg/utils/common.py', {}],
        ['root_mod.py', {}]
      ])

      expect(resolvePythonImport('pkg/sub/mod.py', '.helper', nodes)).toBe('pkg/sub/helper.py')
      expect(resolvePythonImport('pkg/sub/mod.py', '..utils.common', nodes)).toBe('pkg/utils/common.py')
      expect(resolvePythonImport('pkg/sub/mod.py', 'root_mod', nodes)).toBe('root_mod.py')
      expect(resolvePythonImport('pkg/sub/mod.py', 'requests', nodes)).toBeNull()
      expect(resolvePythonImport('pkg/sub/mod.py', '', nodes)).toBeNull()
    })
  })

  describe('resolveJsImport', () => {
    it('should resolve relative, alias, index, and ESM .js->.ts imports', () => {
      const nodes = new Map([
        ['src/App.tsx', {}],
        ['src/utils/helper.ts', {}],
        ['src/components/index.ts', {}]
      ])

      expect(resolveJsImport('src/App.tsx', './utils/helper', nodes)).toBe('src/utils/helper.ts')
      expect(resolveJsImport('src/App.tsx', './utils/helper.js', nodes)).toBe('src/utils/helper.ts')
      expect(resolveJsImport('src/App.tsx', '@/utils/helper', nodes)).toBe('src/utils/helper.ts')
      expect(resolveJsImport('src/App.tsx', './components', nodes)).toBe('src/components/index.ts')
      expect(resolveJsImport('src/App.tsx', 'react', nodes)).toBeNull()
      expect(resolveJsImport('src/App.tsx', '', nodes)).toBeNull()
    })
  })
})
