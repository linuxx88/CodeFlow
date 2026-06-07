import type { Plugin } from 'vite'
import url from 'url'
import { handleScan } from '../../vite-scanner'
import {
  parseConditionalsFromFile,
  parseClassesFromFile,
  parseLoopsFromFile,
  parseRepeatLoopsFromFile,
  parseAlgorithmsFromFile,
  parsePythonStructuresFromFile
} from '../../src/scanner/parser'
import fs from 'fs/promises'
import path from 'path'

export default function scanApi(): Plugin {
  return {
    name: 'scan-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqUrl = url.parse(req.url || '', true)
        
        if (reqUrl.pathname === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status: 'ok' }))
          return
        }
        
        if (reqUrl.pathname === '/api/parse-conflict') {
          const projectPath = reqUrl.query.path as string
          const relativeFilePath = reqUrl.query.file as string
          
          if (!projectPath || !relativeFilePath) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing path or file parameter' }))
            return
          }
          
          const fullFilePath = path.join(path.resolve(projectPath), relativeFilePath)
          try {
            const content = await fs.readFile(fullFilePath, 'utf-8')
            
            const lines = content.split('\n')
            const ourLines: string[] = []
            const theirLines: string[] = []
            
            let inConflict = false
            let isOurSection = false
            
            for (const line of lines) {
              if (line.startsWith('<<<<<<<')) {
                inConflict = true
                isOurSection = true
              } else if (line.startsWith('=======')) {
                isOurSection = false
              } else if (line.startsWith('>>>>>>>')) {
                inConflict = false
              } else {
                if (inConflict) {
                  if (isOurSection) {
                    ourLines.push(line)
                  } else {
                    theirLines.push(line)
                  }
                } else {
                  ourLines.push(line)
                  theirLines.push(line)
                }
              }
            }
            
            const ourContent = ourLines.join('\n')
            const theirContent = theirLines.join('\n')
            
            const parseVersion = (file: string, fileContent: string) => {
              return {
                conditionals: parseConditionalsFromFile(file, fileContent),
                classes: parseClassesFromFile(file, fileContent),
                loops: parseLoopsFromFile(file, fileContent),
                repeatLoops: parseRepeatLoopsFromFile(file, fileContent),
                algorithms: parseAlgorithmsFromFile(file, fileContent),
                pythonStructures: parsePythonStructuresFromFile(file, fileContent)
              }
            }
            
            const ourParsed = parseVersion(relativeFilePath, ourContent)
            const theirParsed = parseVersion(relativeFilePath, theirContent)
            
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              ourParsed,
              theirParsed
            }))
          } catch (e: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }
        
        if (reqUrl.pathname === '/api/scan') {
          const projectPath = reqUrl.query.path as string
          if (!projectPath) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing path parameter' }))
            return
          }
          
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
          })
          
          const abortController = new AbortController()
          req.on('close', () => {
            abortController.abort()
          })
          
          try {
            const data = await handleScan(projectPath, (progress) => {
              if (abortController.signal.aborted) return
              res.write(`data: ${JSON.stringify({ type: 'progress', ...progress })}\n\n`)
            }, abortController.signal)
            
            if (!abortController.signal.aborted) {
              res.write(`data: ${JSON.stringify({ type: 'result', result: data })}\n\n`)
              res.end()
            }
          } catch (e: any) {
            if (e.name === 'AbortError' || abortController.signal.aborted) {
              return
            }
            res.write(`data: ${JSON.stringify({ type: 'error', error: e.message })}\n\n`)
            res.end()
          }
        } else {
          next()
        }
      })
    }
  }
}
