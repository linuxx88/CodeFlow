import type { Connect, Plugin } from 'vite'
import type { ServerResponse } from 'http'
import fs from 'fs/promises'
import path from 'path'
import { handleScan } from '../../vite-scanner.ts'
import {
  parseConditionalsFromFile,
  parseClassesFromFile,
  parseLoopsFromFile,
  parseRepeatLoopsFromFile,
  parseAlgorithmsFromFile,
  parsePythonStructuresFromFile
} from '../../src/scanner/parser.ts'

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function splitConflictContent(content: string): { ourContent: string; theirContent: string } {
  const lines = content.split(/\r?\n/)
  const ourLines: string[] = []
  const theirLines: string[] = []

  let section: 'common' | 'ours' | 'base' | 'theirs' = 'common'

  for (const line of lines) {
    if (line.startsWith('<<<<<<<')) {
      section = 'ours'
    } else if (line.startsWith('|||||||')) {
      section = 'base'
    } else if (line.startsWith('=======')) {
      section = 'theirs'
    } else if (line.startsWith('>>>>>>>')) {
      section = 'common'
    } else if (section === 'ours') {
      ourLines.push(line)
    } else if (section === 'theirs') {
      theirLines.push(line)
    } else if (section === 'common') {
      ourLines.push(line)
      theirLines.push(line)
    }
  }

  return {
    ourContent: ourLines.join('\n'),
    theirContent: theirLines.join('\n')
  }
}

function parseFileVersion(file: string, fileContent: string) {
  return {
    conditionals: parseConditionalsFromFile(file, fileContent),
    classes: parseClassesFromFile(file, fileContent),
    loops: parseLoopsFromFile(file, fileContent),
    repeatLoops: parseRepeatLoopsFromFile(file, fileContent),
    algorithms: parseAlgorithmsFromFile(file, fileContent),
    pythonStructures: parsePythonStructuresFromFile(file, fileContent)
  }
}

function createScanMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const reqUrl = new URL(req.url || '/', 'http://localhost')

    if (reqUrl.pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok' })
      return
    }

    if (reqUrl.pathname === '/api/parse-conflict') {
      const projectPath = reqUrl.searchParams.get('path')
      const relativeFilePath = reqUrl.searchParams.get('file')

      if (!projectPath || !relativeFilePath) {
        sendJson(res, 400, { error: 'Missing path or file parameter' })
        return
      }

      const resolvedProjectPath = path.resolve(projectPath)
      const fullFilePath = path.resolve(resolvedProjectPath, relativeFilePath)
      const rel = path.relative(resolvedProjectPath, fullFilePath)

      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        sendJson(res, 403, { error: 'Invalid file path outside project root' })
        return
      }

      try {
        const content = await fs.readFile(fullFilePath, 'utf-8')
        const { ourContent, theirContent } = splitConflictContent(content)

        sendJson(res, 200, {
          ourParsed: parseFileVersion(relativeFilePath, ourContent),
          theirParsed: parseFileVersion(relativeFilePath, theirContent)
        })
      } catch (e: unknown) {
        const code = (e as NodeJS.ErrnoException)?.code
        const statusCode = code === 'ENOENT' ? 404 : 500
        sendJson(res, statusCode, { error: getErrorMessage(e) })
      }
      return
    }

    if (reqUrl.pathname === '/api/scan') {
      const projectPath = reqUrl.searchParams.get('path')
      if (!projectPath) {
        sendJson(res, 400, { error: 'Missing path parameter' })
        return
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      })

      const abortController = new AbortController()
      res.on('close', () => {
        if (!res.writableEnded) {
          abortController.abort()
        }
      })

      try {
        const data = await handleScan(
          projectPath,
          (progress) => {
            if (abortController.signal.aborted || res.writableEnded) return
            res.write(`data: ${JSON.stringify({ type: 'progress', ...progress })}\n\n`)
          },
          abortController.signal
        )

        if (!abortController.signal.aborted && !res.writableEnded) {
          res.write(`data: ${JSON.stringify({ type: 'result', result: data })}\n\n`)
          res.end()
        }
      } catch (e: unknown) {
        const isAbort = (e instanceof Error && e.name === 'AbortError') || abortController.signal.aborted
        if (isAbort || res.writableEnded) {
          return
        }
        res.write(`data: ${JSON.stringify({ type: 'error', error: getErrorMessage(e) })}\n\n`)
        res.end()
      }
      return
    }

    next()
  }
}

export default function scanApi(): Plugin {
  const middleware = createScanMiddleware()

  return {
    name: 'scan-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    }
  }
}
