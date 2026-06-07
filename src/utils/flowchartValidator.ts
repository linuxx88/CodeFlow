import { MarkerType } from '@xyflow/react'
import type { FlowchartView } from '../constants/views'
import {
  CONDITIONAL_TEMPLATES,
  LOOP_TEMPLATES,
  REPEAT_TEMPLATES,
  ALGO_TEMPLATES,
  PYTHON_TEMPLATES,
  PROCESS_TEMPLATES,
  CLASS_TEMPLATES
} from '../templates'
import {
  buildLoopTemplates,
  buildRepeatLoopTemplates,
  buildAlgoTemplates,
  buildPythonTemplates,
  buildConditionalTemplates
} from './templateBuilders'

export const validateNodesForView = (
  currentView: FlowchartView,
  scanData: any
): { isValid: boolean; message?: string; details?: string } => {
  let templates: Record<string, any> = {}

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
      case 'process-flowchart': {
        templates = { ...PROCESS_TEMPLATES }
        const data = scanData || {}
        const dependencies = data.dependencies || { nodes: [], links: [] }
        const nodesList = dependencies.nodes || []
        const linksList = dependencies.links || []
        const classesList = data.classes || []
        const algorithmsList = data.algorithms || []
        const gitData = data.git || { hotspots: [] }
        const hotspots = gitData.hotspots || []

        const fileCount = nodesList.filter((n: any) => n?.type === 'file').length || 0
        const pkgCount = nodesList.filter((n: any) => n?.type === 'package').length || 0
        const linkCount = linksList.length || 0
        const classCount = classesList.reduce((acc: number, f: any) => acc + (f?.items?.length || 0), 0) || 0
        const functionCount = algorithmsList.reduce((acc: number, f: any) => acc + (f?.items?.length || 0), 0) || 0
        const hotspot = hotspots[0]?.file || 'Aucun'
        const commits = hotspots[0]?.commits || 0

        templates['project-lifecycle'] = {
          name: 'Processus Live de mon Projet',
          description: 'Cycle et métriques en temps réel issues du scan.',
          nodes: [
            { id: 'live-plan', type: 'customNode', position: { x: 250, y: 20 }, data: { label: `1. Initialisation : Projet scanné avec ${fileCount} fichiers`, type: 'start' } },
            { id: 'live-arch', type: 'customNode', position: { x: 250, y: 120 }, data: { label: `2. Architecture : ${pkgCount} packages, ${linkCount} liaisons`, type: 'condition' } },
            { id: 'live-code', type: 'customNode', position: { x: 250, y: 220 }, data: { label: `3. Code : ${functionCount} fonctions, ${classCount} classes`, type: 'action' } },
            { id: 'live-quality', type: 'customNode', position: { x: 250, y: 320 }, data: { label: `4. Git : Hotspot principal: ${hotspot} (${commits} commits)`, type: 'action' } },
            { id: 'live-status', type: 'customNode', position: { x: 250, y: 420 }, data: { label: '5. Statut : Prêt pour la production (build OK)', type: 'action' } }
          ],
          edges: [
            { id: 'el-1', source: 'live-plan', target: 'live-arch', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
            { id: 'el-2', source: 'live-arch', target: 'live-code', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
            { id: 'el-3', source: 'live-code', target: 'live-quality', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
            { id: 'el-4', source: 'live-quality', target: 'live-status', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } }
          ]
        }
        break
      }
      case 'class-diagram': {
        templates = { ...CLASS_TEMPLATES }
        const classesList = scanData?.classes || []
        for (const classFile of classesList) {
          const file = classFile.file || 'Fichier inconnu'
          const items = classFile.items || []
          if (items.length === 0) continue

          const nodes: any[] = []
          items.forEach((item: any, idx: number) => {
            const className = item.name || 'Classe sans nom'
            const inherits = item.inherits || []
            const properties = item.properties || []
            const methods = item.methods || []

            nodes.push({
              id: `class-${className.toLowerCase()}`,
              type: 'classNode',
              position: { x: 50 + (idx % 3) * 260, y: 50 + Math.floor(idx / 3) * 280 },
              data: {
                name: className,
                inherits,
                properties,
                methods
              }
            })
          })
          const edges: any[] = []
          items.forEach((item: any) => {
            if (item.inherits) {
              const parentId = `class-${item.inherits.toLowerCase()}`
              const childId = `class-${item.name.toLowerCase()}`
              if (nodes.some(n => n.id === parentId)) {
                edges.push({
                  id: `edge-inherits-${childId}-${parentId}`,
                  source: childId,
                  target: parentId,
                  type: 'smoothstep',
                  label: 'HÉRITE',
                  style: { stroke: 'var(--accent)', strokeWidth: 2 },
                  labelStyle: { fill: 'var(--accent)', fontWeight: 'bold' },
                  markerEnd: { type: MarkerType.ArrowClosed }
                })
              }
            }
          })
          templates[`project-${file}`] = {
            name: `Projet: ${file}`,
            description: `Diagramme de classes - ${items.length} classes détectées.`,
            nodes,
            edges
          }
        }
        break
      }
      default:
        return { isValid: false, message: `Vue non reconnue ou corrompue: "${currentView}"` }
    }
  } catch (err: any) {
    return { isValid: false, message: 'Erreur lors de la construction des données du flowchart', details: err.message }
  }

  for (const [key, template] of Object.entries(templates)) {
    if (!template || typeof template !== 'object') {
      return { isValid: false, message: `Modèle invalide pour la clé "${key}".` }
    }
    if (!Array.isArray(template.nodes)) {
      return { isValid: false, message: `Le modèle "${template.name || key}" ne contient pas de liste de nœuds valide.` }
    }

    for (const node of template.nodes) {
      if (!node || typeof node !== 'object') {
        return { isValid: false, message: `Nœud mal formé dans le modèle "${template.name || key}".` }
      }
      if (!node.id || typeof node.id !== 'string') {
        return { isValid: false, message: `Identifiant de nœud manquant ou invalide dans le modèle "${template.name || key}".` }
      }

      if (currentView === 'class-diagram') {
        if (node.type !== 'classNode') {
          return {
            isValid: false,
            message: `Type de cible de rendu React Flow invalide: attendu "classNode", obtenu "${node.type || 'non défini'}".`,
            details: `Modèle: ${template.name || key}\nNœud ID: ${node.id}`
          }
        }
        const data = node.data || {}
        const className = data.name
        if (typeof className !== 'string') {
          return {
            isValid: false,
            message: "Le nœud de classe n'a pas de nom valide ou des attributs requis manquants.",
            details: `Modèle: ${template.name || key}\nNœud ID: ${node.id}\nDonnées: ${JSON.stringify(data)}`
          }
        }
      } else {
        if (node.type !== 'customNode') {
          return {
            isValid: false,
            message: `Type de cible de rendu React Flow invalide: attendu "customNode", obtenu "${node.type || 'non défini'}".`,
            details: `Modèle: ${template.name || key}\nNœud ID: ${node.id}`
          }
        }
        const data = node.data || {}
        const label = data.label || 'Élément'
        const nodeType = data.type || 'action'

        if (typeof label !== 'string') {
          return {
            isValid: false,
            message: `Le nœud "${node.id}" n'a pas de libellé (label) de type chaîne de caractères.`,
            details: `Modèle: ${template.name || key}\nDonnées: ${JSON.stringify(data)}`
          }
        }
        if (nodeType !== 'start' && nodeType !== 'condition' && nodeType !== 'action') {
          return {
            isValid: false,
            message: `Type de nœud non reconnu ou corrompu "${nodeType}" (attendu 'start', 'condition' ou 'action').`,
            details: `Modèle: ${template.name || key}\nNœud ID: ${node.id}\nLibellé: "${label}"`
          }
        }
      }
    }
  }

  return { isValid: true }
}
