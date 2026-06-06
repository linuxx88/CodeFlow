import type { Plugin } from 'vite'
import url from 'url'
import { handleScan } from '../../vite-scanner'

export default function scanApi(): Plugin {
  return {
    name: 'scan-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const reqUrl = url.parse(req.url || '', true)
        if (reqUrl.pathname === '/api/scan') {
          const projectPath = reqUrl.query.path as string
          if (!projectPath) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing path parameter' }))
            return
          }
          try {
            const data = handleScan(projectPath)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          } catch (e: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
        } else {
          next()
        }
      })
    }
  }
}
