import React, { useMemo } from 'react'
import { AlertTriangle, FolderOpen } from 'lucide-react'

const EmptyState: React.FC = () => {
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
        border: '1.5px dashed var(--border)',
        boxShadow: '0 8px 32px 0 var(--shadow)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        gap: '16px',
        margin: '20px',
        boxSizing: 'border-box',
        color: 'var(--text-muted)'
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
          backgroundColor: 'var(--accent-muted)',
          border: '1.5px solid var(--accent)',
          boxShadow: '0 0 16px var(--accent-glow)',
          marginBottom: '8px'
        }}
      >
        <FolderOpen size={30} color="var(--accent)" />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>
        Aucun projet ou fichier chargé
      </h3>
      <p style={{ fontSize: '13px', margin: 0, maxWidth: '380px', lineHeight: '1.5', opacity: 0.8 }}>
        Sélectionnez un fichier dans l'explorateur pour afficher son diagramme.
      </p>
    </div>
  )
}
import { ConditionalStatementFlowchart } from './ConditionalStatementFlowchart'
import { ClassDiagramFlowchart } from './ClassDiagramFlowchart'
import { WhileLoopFlowchart } from './WhileLoopFlowchart'
import { RepeatLoopFlowchart } from './RepeatLoopFlowchart'
import { AlgorithmFlowchart } from './AlgorithmFlowchart'
import { AppDevelopmentProcessFlowchart } from './AppDevelopmentProcessFlowchart'
import { PythonFlowchart } from './PythonFlowchart'
import type { FlowchartView } from '../constants/views'
import { validateNodesForView } from '../utils/flowchartValidator'

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

export const FlowchartRenderer: React.FC<FlowchartRendererProps> = ({ currentView, scanData }) => {
  const renderKey = useMemo(() => {
    try {
      return `${currentView}-${JSON.stringify(scanData || {})}`
    } catch {
      return `${currentView}-error`
    }
  }, [currentView, scanData])

  if (!scanData) {
    return <EmptyState />
  }

  const validation = validateNodesForView(currentView, scanData)

  if (!validation.isValid) {
    return <ValidationErrorUI message={validation.message || ''} details={validation.details} />
  }

  switch (currentView) {
    case 'conditional-statement':
      return <ConditionalStatementFlowchart key={renderKey} scanData={scanData} />
    case 'class-diagram':
      return <ClassDiagramFlowchart key={renderKey} scanData={scanData} />
    case 'while-loop':
      return <WhileLoopFlowchart key={renderKey} scanData={scanData} />
    case 'repeat-loop':
      return <RepeatLoopFlowchart key={renderKey} scanData={scanData} />
    case 'algo':
      return <AlgorithmFlowchart key={renderKey} scanData={scanData} />
    case 'process-flowchart':
      return <AppDevelopmentProcessFlowchart key={renderKey} scanData={scanData} />
    case 'python-flowchart':
      return <PythonFlowchart key={renderKey} scanData={scanData} />
    default:
      return null
  }
}
