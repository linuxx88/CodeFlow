import React, { useEffect, useRef } from 'react'
import { ReactFlowProvider, useReactFlow, useNodes, useEdges, useUpdateNodeInternals } from '@xyflow/react'
import { GenericFlowchart } from './GenericFlowchart'
import { REPEAT_TEMPLATES } from '../templates'

interface RepeatLoopFlowchartProps {
  scanData?: any
}

const FlowchartLayoutObserver: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({ containerRef }) => {
  const { fitView } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const nodes = useNodes()
  const edges = useEdges()

  const layoutStateRef = useRef<string>('')
  const nodesRef = useRef(nodes)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    const currentState = `${nodes.length}-${edges.length}-${nodes.map(n => `${n.id}:${n.position.x}:${n.position.y}`).join(',')}`
    if (currentState !== layoutStateRef.current && nodes.length > 0) {
      layoutStateRef.current = currentState
      nodes.forEach((node) => {
        updateNodeInternals(node.id)
      })
      fitView({ duration: 0 })
    }
  }, [nodes, edges, updateNodeInternals, fitView])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      const currentNodes = nodesRef.current
      if (currentNodes.length > 0) {
        currentNodes.forEach((node) => {
          updateNodeInternals(node.id)
        })
        fitView({ duration: 0 })
      }
      window.dispatchEvent(new Event('resize'))
    })

    resizeObserver.observe(container)
    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, updateNodeInternals, fitView])

  return null
}

export const RepeatLoopFlowchart: React.FC<RepeatLoopFlowchartProps> = ({ scanData }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <ReactFlowProvider>
      <div ref={containerRef} style={{ display: 'flex', flex: 1, width: '100%', height: '100%' }}>
        <GenericFlowchart
          templates={REPEAT_TEMPLATES}
          title="Sélectionner un Modèle Repeat (Do-While)"
          scanData={scanData}
          filterType="repeat"
        />
        <FlowchartLayoutObserver containerRef={containerRef} />
      </div>
    </ReactFlowProvider>
  )
}
