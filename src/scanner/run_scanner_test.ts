import fs from 'fs/promises'
import path from 'path'
import { handleScan } from './index'
import { findCycles } from '../utils/projectUtils'

const MOCK_DIR = path.resolve('./mock_project_test')

async function setupMockProject() {
  await fs.mkdir(MOCK_DIR, { recursive: true })

  // JS files
  await fs.writeFile(path.join(MOCK_DIR, 'js_dep.js'), '// empty')
  await fs.writeFile(path.join(MOCK_DIR, 'js_dep2.js'), '// empty')
  await fs.writeFile(
    path.join(MOCK_DIR, 'js_multi.js'),
    `import {
  foo,
  bar
} from './js_dep.js'
import simple from './js_dep2.js'
`
  )

  // Python files
  await fs.writeFile(path.join(MOCK_DIR, 'py_dep.py'), '# empty')
  await fs.writeFile(path.join(MOCK_DIR, 'py_dep2.py'), '# empty')
  await fs.writeFile(
    path.join(MOCK_DIR, 'py_rel.py'),
    `from .py_dep import my_func
import py_dep2
`
  )

  // Cycle files
  await fs.writeFile(path.join(MOCK_DIR, 'cycle_a.js'), "import './cycle_b.js'")
  await fs.writeFile(path.join(MOCK_DIR, 'cycle_b.js'), "import './cycle_c.js'")
  await fs.writeFile(path.join(MOCK_DIR, 'cycle_c.js'), "import './cycle_a.js'")

  // Unreadable directory/file
  const unreadableDir = path.join(MOCK_DIR, 'unreadable_dir')
  await fs.mkdir(unreadableDir, { recursive: true })
  await fs.writeFile(path.join(unreadableDir, 'secret.js'), '// secret')
  await fs.chmod(unreadableDir, 0o000)
}

async function cleanupMockProject() {
  try {
    await fs.chmod(path.join(MOCK_DIR, 'unreadable_dir'), 0o755)
  } catch (e) {}
  await fs.rm(MOCK_DIR, { recursive: true, force: true })
}

async function runTests() {
  console.log('--- Setting up mock project ---')
  await setupMockProject()

  try {
    console.log('--- Running scanner ---')
    const result = await handleScan(MOCK_DIR)

    console.log('--- Verifying results ---')
    
    // Check files scanned
    const scannedFiles = result.dependencies.nodes.filter(n => n.type === 'file').map(n => n.id)
    console.log('Scanned files:', scannedFiles)

    // Check links
    const links = result.dependencies.links
    console.log('Detected links:')
    links.forEach(l => console.log(`  ${l.source} -> ${l.target} (${l.type})`))

    // Verification of multi-line import in JS
    const hasJsDep1 = links.some(l => l.source === 'js_multi.js' && l.target === 'js_dep.js')
    const hasJsDep2 = links.some(l => l.source === 'js_multi.js' && l.target === 'js_dep2.js')

    console.log(`Check JS multi-line (js_dep.js): ${hasJsDep1 ? 'SUCCESS' : 'FAILED'}`)
    console.log(`Check JS simple import (js_dep2.js): ${hasJsDep2 ? 'SUCCESS' : 'FAILED'}`)

    // Verification of Python imports
    const hasPyDep1 = links.some(l => l.source === 'py_rel.py' && l.target === 'py_dep.py')
    const hasPyDep2 = links.some(l => l.source === 'py_rel.py' && l.target === 'py_dep2.py')

    console.log(`Check Python relative import (py_dep.py): ${hasPyDep1 ? 'SUCCESS' : 'FAILED'}`)
    console.log(`Check Python absolute import (py_dep2.py): ${hasPyDep2 ? 'SUCCESS' : 'FAILED'}`)

    // Verification of Cycles
    const cycleInfo = findCycles(result.dependencies.nodes, result.dependencies.links)
    console.log('Detected cycles (sccs):', cycleInfo.sccs)
    const hasCycle = cycleInfo.cycleNodes.has('cycle_a.js') && cycleInfo.cycleNodes.has('cycle_b.js') && cycleInfo.cycleNodes.has('cycle_c.js')
    console.log(`Check cycle detection (cycle_a,b,c): ${hasCycle ? 'SUCCESS' : 'FAILED'}`)

    // Verification of unreadable directory error propagation
    const unreadableNode = result.structure?.children?.find((c: any) => c.name === 'unreadable_dir')
    const hasUnreadableDirNode = !!unreadableNode
    const hasUnreadableError = unreadableNode?.error !== undefined && (unreadableNode?.error?.code === 'EACCES' || unreadableNode?.error?.code === 'EPERM')
    console.log(`Check unreadable directory presence: ${hasUnreadableDirNode ? 'SUCCESS' : 'FAILED'}`)
    console.log(`Check error propagated on unreadable directory: ${hasUnreadableError ? 'SUCCESS' : 'FAILED'} (code: ${unreadableNode?.error?.code}, message: ${unreadableNode?.error?.message})`)

    if (!hasJsDep1 || !hasJsDep2 || !hasPyDep1 || !hasPyDep2 || !hasCycle || !hasUnreadableDirNode || !hasUnreadableError) {
      console.error('\nFAIL: Some tests failed.')
      process.exitCode = 1
    } else {
      console.log('\nSUCCESS: All scanner tests passed!')
    }

  } catch (error) {
    console.error('Error during test:', error)
    process.exitCode = 1
  } finally {
    console.log('--- Cleanup ---')
    await cleanupMockProject()
  }
}

runTests()
