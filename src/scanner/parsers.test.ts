import { describe, it, expect } from 'vitest'
import {
  parseConditionalsFromFile,
  parseClassesFromFile,
  parseLoopsFromFile,
  parseRepeatLoopsFromFile,
  parseAlgorithmsFromFile,
  parsePythonStructuresFromFile,
  ParserRegistry,
  ParserStrategy
} from './parser'

describe('AST Scanner Parsers', () => {
  describe('parseConditionalsFromFile', () => {
    it('should parse JS if-else statements correctly', () => {
      const code = `
        if (x > 10) {
          console.log("greater");
        }
        else {
          console.log("smaller");
        }
      `
      const result = parseConditionalsFromFile('test.js', code)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual({
        type: 'ifelse',
        line: 2,
        condition: 'x > 10',
        then: 'console.log("greater");',
        else: 'console.log("smaller");'
      })
    })

    it('should parse Python if-else statements correctly', () => {
      const code = `
if val == 42:
    print("Correct")
else:
    print("Wrong")
`
      const result = parseConditionalsFromFile('test.py', code)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual({
        type: 'ifelse',
        line: 2,
        condition: 'val == 42',
        then: 'print("Correct")',
        else: 'print("Wrong")'
      })
    })

    it('should parse JS switch statements correctly', () => {
      const code = `
        switch (type) {
          case 'a':
            break;
          case 'b':
            break;
          default:
            break;
        }
      `
      const result = parseConditionalsFromFile('test.js', code)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual({
        type: 'switch',
        line: 2,
        expression: 'type',
        cases: ["'a'", "'b'", 'default']
      })
    })
  })

  describe('parseClassesFromFile', () => {
    it('should parse JS/TS classes with properties and methods', () => {
      const code = `
        class UserController extends BaseController {
          service: UserService;
          id = 123;
          
          getUser() {
            return this.service.get();
          }
        }
      `
      const result = parseClassesFromFile('test.ts', code)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual({
        name: 'UserController',
        inherits: 'BaseController',
        properties: ['service', 'id'],
        methods: ['getUser'],
        line: 2
      })
    })

    it('should parse Python classes with self fields and methods', () => {
      const code = `
class Dog(Animal):
    def __init__(self, name):
        self.name = name
        self.age = 5
    
    def bark(self):
        print("Woof")
`
      const result = parseClassesFromFile('test.py', code)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual({
        name: 'Dog',
        inherits: 'Animal',
        properties: ['name', 'age'],
        methods: ['bark'],
        line: 2
      })
    })
  })

  describe('parseLoopsFromFile & parseRepeatLoopsFromFile', () => {
    it('should parse JS while loops', () => {
      const code = `
        while (count < 10) {
          count++;
        }
      `
      const result = parseLoopsFromFile('test.js', code)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual({
        type: 'while',
        line: 2,
        condition: 'count < 10',
        body: 'count++;'
      })
    })

    it('should parse repeat loops if any matching format exists', () => {
      const code = `
        do {
          x = x + 1;
        } while (x > 10)
      `
      const result = parseRepeatLoopsFromFile('test.js', code)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual({
        type: 'repeat',
        line: 2,
        condition: 'x > 10',
        body: 'x = x + 1;'
      })
    })
  })

  describe('parseAlgorithmsFromFile', () => {
    it('should parse JS function structures as algorithms', () => {
      const code = `
        function calculateTotal(items) {
          let total = 0;
          for (let item of items) {
            total += item.price;
          }
          return total;
        }
      `
      const result = parseAlgorithmsFromFile('test.js', code)
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('calculateTotal')
      expect(result[0].steps.length).toBeGreaterThan(0)
    })

    it('should parse Python function defs as algorithms', () => {
      const code = `
def process_data(data):
    val = clean(data)
    save(val)
    return val
`
      const result = parseAlgorithmsFromFile('test.py', code)
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('process_data')
      expect(result[0].args).toBe('data')
      expect(result[0].steps).toEqual(['val = clean(data)', 'save(val)', 'return val'])
    })
  })

  describe('parsePythonStructuresFromFile', () => {
    it('should parse Python try-except blocks and decorators', () => {
      const code = `
@logger
def run():
    try:
        do_something()
    except Exception as e:
        handle_error(e)
`
      const result = parsePythonStructuresFromFile('test.py', code)
      expect(result.length).toBe(2)
      expect(result[0]).toEqual({
        type: 'decorator',
        name: 'logger',
        line: 2
      })
      expect(result[1]).toEqual({
        type: 'tryexcept',
        line: 4,
        try: 'do_something()',
        except: 'Exception as e'
      })
    })
  })

  describe('ParserRegistry & Strategy Pattern', () => {
    it('should allow dynamic registration of custom strategies', () => {
      const customParser: ParserStrategy = {
        id: 'customTest',
        supports: (file) => file.endsWith('.custom'),
        parse: (file, content) => [{ type: 'custom', data: content.trim() }]
      }

      ParserRegistry.register(customParser)

      const parsers = ParserRegistry.getParsersForFile('test.custom')
      expect(parsers.some((p) => p.id === 'customTest')).toBe(true)

      const result = ParserRegistry.getParser('customTest')?.parse('test.custom', 'hello')
      expect(result).toEqual([{ type: 'custom', data: 'hello' }])
    })

    it('should handle parser strategy errors in isolation without failing others', () => {
      const faultyParser: ParserStrategy = {
        id: 'faulty',
        supports: (file) => file.endsWith('.js'),
        parse: () => {
          throw new Error('Parsing failed')
        }
      }

      ParserRegistry.register(faultyParser)

      const parsers = ParserRegistry.getParsersForFile('test.js')
      expect(parsers.some((p) => p.id === 'faulty')).toBe(true)

      // Ensure index.ts parsing-like loop works when encountering errors
      const fileResults: Record<string, any[]> = {}
      const code = `
        if (x > 10) {
          console.log("greater");
        }
        else {
          console.log("smaller");
        }
      `
      for (const parser of parsers) {
        try {
          const items = parser.parse('test.js', code)
          if (items.length > 0) {
            fileResults[parser.id] = items
          }
        } catch (e) {
          // Faulty parser shouldn't propagate error
        }
      }

      expect(fileResults.conditionals).toBeDefined()
      expect(fileResults.faulty).toBeUndefined()
    })
  })
})
