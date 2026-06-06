import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { IfThenFlowchart } from './IfThenFlowchart'
import { ConditionalStatementFlowchart } from './ConditionalStatementFlowchart'
import { ClassDiagramFlowchart } from './ClassDiagramFlowchart'
import { WhileLoopFlowchart } from './WhileLoopFlowchart'
import { RepeatLoopFlowchart } from './RepeatLoopFlowchart'
import { AlgorithmFlowchart } from './AlgorithmFlowchart'
import { AppDevelopmentProcessFlowchart } from './AppDevelopmentProcessFlowchart'
import { PythonFlowchart } from './PythonFlowchart'
import type { FlowchartView } from '../constants/views'
import {
  TEMPLATES,
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
} from '../utils/templateBuilders'

interface FlowchartRendererProps {
  currentView: FlowchartView
  scanData: any
}

interface ValidationErrorProps {
  message: string
  details?: string
}

const ValidationErrorUI: React.FC<ValidationErrorProps> = ({ message, details }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'calc(100% - 40px)',
        height: 'calc(100% - 40px)',
        minHeight: '400px',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(244, 63, 94, 0.3)',
        boxShadow: '0 8px 32px 0 var(--shadow), 0 0 12px rgba(244, 63, 94, 0.1)',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        gap: '20px',
        margin: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          border: '1.5px solid #f43f5e',
          boxShadow: '0 0 16px rgba(244, 63, 94, 0.3)'
        }}
      >
        <AlertTriangle size={32} color="#f43f5e" />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f43f5e', margin: 0, letterSpacing: '0.5px' }}>
        Erreur de validation du Flowchart
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0, maxWidth: '480px', lineHeight: '1.6', opacity: 0.9 }}>
        {message}
      </p>
      {details && (
        <pre
          style={{
            fontSize: '12px',
            backgroundColor: 'var(--input-bg)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            width: '100%',
            maxWidth: '500px',
            overflowX: 'auto',
            textAlign: 'left',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            margin: '8px 0 0 0',
            lineHeight: '1.5'
          }}
        >
          {details}
        </pre>
      )}
    </div>
  )
}

const validateNodesForView = (
  currentView: FlowchartView,
  scanData: any
): { isValid: boolean; message?: string; details?: string } => {
  let templates: Record<string, any> = {}

  try {
    switch (currentView) {
      case 'if-then':
        templates = buildConditionalTemplates(scanData, TEMPLATES, 'ifelse')
        break
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
        if (scanData) {
          const fileCount = scanData.dependencies?.nodes?.filter((n: any) => n.type === 'file').length || 0
          const pkgCount = scanData.dependencies?.nodes?.filter((n: any) => n.type === 'package').length || 0
          const linkCount = scanData.dependencies?.links?.length || 0
          const classCount = scanData.classes?.reduce((acc: number, f: any) => acc + f.items.length, 0) || 0
          const functionCount = scanData.algorithms?.reduce((acc: number, f: any) => acc + f.items.length, 0) || 0
          const hotspot = scanData.git?.hotspots?.[0]?.file || 'Aucun'
          const commits = scanData.git?.hotspots?.[0]?.commits || 0

          templates['project-lifecycle'] = {
            name: 'Processus Live de mon Projet',
            description: 'Cycle et métriques en temps réel issues du scan.',
            nodes: [
              { id: 'live-plan', type: 'customNode', position: { x: 250, y: 20 }, data: { label: `1. Initialisation : Projet scanné avec ${fileCount} fichiers`, type: 'start' } },
              { id: 'live-arch', type: 'customNode', position: { x: 250, y: 120 }, data: { label: `2. Architecture : ${pkgCount} packages, ${linkCount} liaisons`, type: 'condition' } },
              { id: 'live-code', type: 'customNode', position: { x: 250, y: 220 }, data: { label: `3. Code : ${functionCount} fonctions, ${classCount} classes`, type: 'action' } },
              { id: 'live-quality', type: 'customNode', position: { x: 250, y: 320 }, data: { label: `4. Git : Hotspot principal: ${hotspot} (${commits} commits)`, type: 'action' } },
              { id: 'live-status', type: 'customNode', position: { x: 250, y: 420 }, data: { label: '5. Statut : Prêt pour la production (build OK)', type: 'action' } }
            ]
          }
        }
        break
      }
      case 'class-diagram': {
        templates = { ...CLASS_TEMPLATES }
        if (scanData?.classes) {
          for (const classFile of scanData.classes) {
            const file = classFile.file
            const items = classFile.items
            if (items.length === 0) continue

            const nodes: any[] = []
            items.forEach((item: any, idx: number) => {
              nodes.push({
                id: `class-${item.name.toLowerCase()}`,
                type: 'classNode',
                position: { x: 50 + (idx % 3) * 260, y: 50 + Math.floor(idx / 3) * 280 },
                data: {
                  name: item.name,
                  inherits: item.inherits,
                  properties: item.properties,
                  methods: item.methods
                }
              })
            })
            templates[`project-${file}`] = {
              name: `Projet: ${file}`,
              description: `Diagramme de classes - ${items.length} classes détectées.`,
              nodes
            }
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
        const data = node.data
        if (!data || typeof data !== 'object' || typeof data.name !== 'string') {
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
        const data = node.data
        if (!data || typeof data !== 'object') {
          return {
            isValid: false,
            message: `Le nœud "${node.id}" n'a pas de données (data) définies.`,
            details: `Modèle: ${template.name || key}`
          }
        }
        if (typeof data.label !== 'string') {
          return {
            isValid: false,
            message: `Le nœud "${node.id}" n'a pas de libellé (label) de type chaîne de caractères.`,
            details: `Modèle: ${template.name || key}\nDonnées: ${JSON.stringify(data)}`
          }
        }
        const nodeType = data.type
        if (!nodeType) {
          return {
            isValid: false,
            message: `Type de nœud non défini pour le nœud "${node.id}" (l'action par défaut est interdite).`,
            details: `Modèle: ${template.name || key}`
          }
        }
        if (nodeType !== 'start' && nodeType !== 'condition' && nodeType !== 'action') {
          return {
            isValid: false,
            message: `Type de nœud non reconnu ou corrompu "${nodeType}" (attendu 'start', 'condition' ou 'action').`,
            details: `Modèle: ${template.name || key}\nNœud ID: ${node.id}\nLibellé: "${data.label}"`
          }
        }
      }
    }
  }

  return { isValid: true }
}

export const FlowchartRenderer: React.FC<FlowchartRendererProps> = ({ currentView, scanData }) => {
  const validation = validateNodesForView(currentView, scanData)

  if (!validation.isValid) {
    return <ValidationErrorUI message={validation.message || ''} details={validation.details} />
  }

  switch (currentView) {
    case 'if-then':
      return <IfThenFlowchart scanData={scanData} />
    case 'conditional-statement':
      return <ConditionalStatementFlowchart scanData={scanData} />
    case 'class-diagram':
      return <ClassDiagramFlowchart scanData={scanData} />
    case 'while-loop':
      return <WhileLoopFlowchart scanData={scanData} />
    case 'repeat-loop':
      return <RepeatLoopFlowchart scanData={scanData} />
    case 'algo':
      return <AlgorithmFlowchart scanData={scanData} />
    case 'process-flowchart':
      return <AppDevelopmentProcessFlowchart scanData={scanData} />
    case 'python-flowchart':
      return <PythonFlowchart scanData={scanData} />
    default:
      return null
  }
}
