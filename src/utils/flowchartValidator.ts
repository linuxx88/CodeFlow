import type { FlowchartView } from '../constants/views'
import {
  CONDITIONAL_TEMPLATES,
  LOOP_TEMPLATES,
  REPEAT_TEMPLATES,
  ALGO_TEMPLATES,
  PYTHON_TEMPLATES,
  PROCESS_TEMPLATES,
  CLASS_TEMPLATES,
} from '../templates'
import {
  buildLoopTemplates,
  buildRepeatLoopTemplates,
  buildAlgoTemplates,
  buildPythonTemplates,
  buildConditionalTemplates,
  buildClassTemplates,
  buildProcessTemplates,
} from './templateBuilders'
import type { ScanData, Template, ValidationResult } from '../types'

export const validateNodesForView = (
  currentView: FlowchartView,
  scanData: ScanData | null | undefined
): ValidationResult => {
  let templates: Record<string, Template> = {}

  try {
    switch (currentView) {
      case 'conditional-statement':
        templates = buildConditionalTemplates(scanData, CONDITIONAL_TEMPLATES, 'all')
        break
      case 'while-loop':
        templates = buildLoopTemplates(scanData, LOOP_TEMPLATES)
        break
      case 'repeat-loop':
        templates = buildRepeatLoopTemplates(scanData, REPEAT_TEMPLATES)
        break
      case 'algo':
        templates = buildAlgoTemplates(scanData, ALGO_TEMPLATES)
        break
      case 'python-flowchart':
        templates = buildPythonTemplates(scanData, PYTHON_TEMPLATES)
        break
      case 'process-flowchart':
        templates = buildProcessTemplates(scanData, PROCESS_TEMPLATES)
        break
      case 'class-diagram':
        templates = buildClassTemplates(scanData, CLASS_TEMPLATES)
        break
      default:
        return { isValid: false, message: `Unrecognized or corrupted view: "${currentView}"` }
    }
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err)
    return {
      isValid: false,
      message: 'Error building flowchart data',
      details,
    }
  }

  for (const [key, template] of Object.entries(templates)) {
    if (!template || typeof template !== 'object') {
      return { isValid: false, message: `Invalid template for key "${key}".` }
    }
    if (!Array.isArray(template.nodes)) {
      return {
        isValid: false,
        message: `Template "${template.name || key}" does not contain a valid node list.`,
      }
    }
    if (template.edges !== undefined && !Array.isArray(template.edges)) {
      return {
        isValid: false,
        message: `Template "${template.name || key}" does not contain a valid edge list.`,
      }
    }

    for (const node of template.nodes) {
      if (!node || typeof node !== 'object') {
        return { isValid: false, message: `Malformed node in template "${template.name || key}".` }
      }
      if (!node.id || typeof node.id !== 'string') {
        return {
          isValid: false,
          message: `Missing or invalid node ID in template "${template.name || key}".`,
        }
      }

      if (currentView === 'class-diagram') {
        if (node.type !== 'classNode') {
          return {
            isValid: false,
            message: `Invalid React Flow render target type: expected "classNode", got "${node.type || 'undefined'}".`,
            details: `Template: ${template.name || key}\nNode ID: ${node.id}`,
          }
        }
        const data = node.data || {}
        if (typeof data.name !== 'string') {
          return {
            isValid: false,
            message: 'Class node is missing a valid name or required attributes.',
            details: `Template: ${template.name || key}\nNode ID: ${node.id}\nData: ${JSON.stringify(data)}`,
          }
        }
      } else {
        if (node.type !== 'customNode') {
          return {
            isValid: false,
            message: `Invalid React Flow render target type: expected "customNode", got "${node.type || 'undefined'}".`,
            details: `Template: ${template.name || key}\nNode ID: ${node.id}`,
          }
        }
        const data = node.data || {}
        const label = data.label || 'Element'
        const nodeType = data.type || 'action'

        if (typeof label !== 'string') {
          return {
            isValid: false,
            message: `Node "${node.id}" does not have a string label.`,
            details: `Template: ${template.name || key}\nData: ${JSON.stringify(data)}`,
          }
        }
        if (nodeType !== 'start' && nodeType !== 'condition' && nodeType !== 'action') {
          return {
            isValid: false,
            message: `Unrecognized or corrupted node type "${nodeType}" (expected 'start', 'condition', or 'action').`,
            details: `Template: ${template.name || key}\nNode ID: ${node.id}\nLabel: "${label}"`,
          }
        }
      }
    }
  }

  return { isValid: true }
}
