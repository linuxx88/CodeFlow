import React, { useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls
} from '@xyflow/react'
import { Plus, Trash2, Check, HelpCircle, Code } from 'lucide-react'

import { IfThenCustomNode } from './IfThenCustomNode'
import { useFlowchartEditor } from '../hooks/useFlowchartEditor'
import type { Template } from '../utils/templateBuilders'
import {
  buildLoopTemplates,
  buildRepeatLoopTemplates,
  buildAlgoTemplates,
  buildPythonTemplates,
  buildConditionalTemplates
} from '../utils/templateBuilders'

interface GenericFlowchartProps {
  templates: Record<string, Template>
  title: string
  scanData?: any
  filterType?: 'all' | 'ifelse' | 'loop' | 'repeat' | 'algo' | 'python'
}

const nodeTypes = {
  customNode: IfThenCustomNode
}

export const GenericFlowchart: React.FC<GenericFlowchartProps> = ({
  templates,
  title,
  scanData,
  filterType = 'all'
}) => {
  const projectTemplates = useMemo(() => {
    if (filterType === 'loop') {
      return buildLoopTemplates(scanData, templates)
    } else if (filterType === 'repeat') {
      return buildRepeatLoopTemplates(scanData, templates)
    } else if (filterType === 'algo') {
      return buildAlgoTemplates(scanData, templates)
    } else if (filterType === 'python') {
      return buildPythonTemplates(scanData, templates)
    } else {
      return buildConditionalTemplates(scanData, templates, filterType)
    }
  }, [templates, scanData, filterType])

  const defaultTemplateKey = Object.keys(projectTemplates)[0] || ''
  const [activeTemplate, setActiveTemplate] = useState<string>(defaultTemplateKey)
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    nodeLabel,
    setNodeLabel,
    nodeType,
    setNodeType,
    handleNodeClick,
    handleUpdateNode,
    handleAddNode,
    handleDeleteNode
  } = useFlowchartEditor()

  useEffect(() => {
    const projectKeys = Object.keys(projectTemplates).filter(k => k.startsWith('project-'))
    const timer = setTimeout(() => {
      if (projectKeys.length > 0) {
        setActiveTemplate(projectKeys[0])
      } else {
        const defaultKey = Object.keys(projectTemplates)[0] || ''
        setActiveTemplate(defaultKey)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [projectTemplates])

  useEffect(() => {
    const template = projectTemplates[activeTemplate]
    if (template) {
      const timer = setTimeout(() => {
        setNodes(template.nodes)
        setEdges(template.edges)
        setSelectedNodeId(null)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeTemplate, projectTemplates, setNodes, setEdges, setSelectedNodeId])

  const projectItems = Object.entries(projectTemplates).filter(([k]) => k.startsWith('project-'))
  const staticItems = Object.entries(projectTemplates).filter(([k]) => !k.startsWith('project-'))

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', backgroundColor: 'var(--bg)' }}>
      {/* Side Editor */}
      <div
        style={{
          width: '320px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--panel-bg)',
          backdropFilter: 'blur(12px)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          transition: 'background-color 0.3s, border-color 0.3s'
        }}
      >
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>
            {title}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projectItems.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={12} /> Flowcharts Live du Projet
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projectItems.map(([key, temp]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTemplate(key)}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        backgroundColor: activeTemplate === key ? 'var(--accent)' : 'var(--input-bg)',
                        color: activeTemplate === key ? '#fff' : 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{temp.name}</div>
                      <div style={{ fontSize: '11px', color: activeTemplate === key ? '#e0e0ff' : 'var(--text-muted)', marginTop: '4px' }}>
                        {temp.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              {projectItems.length > 0 && (
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Modèles de Démo
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {staticItems.map(([key, temp]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTemplate(key)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      backgroundColor: activeTemplate === key ? 'var(--accent)' : 'var(--input-bg)',
                      color: activeTemplate === key ? '#fff' : 'var(--text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{temp.name}</div>
                    <div style={{ fontSize: '11px', color: activeTemplate === key ? '#e0e0ff' : 'var(--text-muted)', marginTop: '4px' }}>
                      {temp.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>

        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>
            Éditeur de Nœud
          </h2>
          {selectedNodeId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Texte du Nœud
                </label>
                <input
                  type="text"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {selectedNodeId !== 'start' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Type de Nœud
                  </label>
                  <select
                    value={nodeType}
                    onChange={(e: any) => setNodeType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--dropdown-bg)',
                      color: 'var(--text)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="condition">SI / Condition (Condition)</option>
                    <option value="action">ALORS / Action (Action)</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handleUpdateNode}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Check size={14} /> Appliquer
                </button>
                {selectedNodeId !== 'start' && (
                  <button
                    onClick={handleDeleteNode}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(244, 63, 94, 0.15)',
                      color: '#f43f5e',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} /> Cliquez sur un nœud pour le modifier.
            </div>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>

        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>
            Ajouter un Élément
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAddNode('condition')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Condition
            </button>
            <button
              onClick={() => handleAddNode('action')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Action
            </button>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background color="var(--border)" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
