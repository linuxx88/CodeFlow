import type { Plugin } from 'vite'
import url from 'url'
import { handleScan } from '../../vite-scanner'

export default function scanApi(): Plugin {
  return {
    name: 'scan-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqUrl = url.parse(req.url || '', true)
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
