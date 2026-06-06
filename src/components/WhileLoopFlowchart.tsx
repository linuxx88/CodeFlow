import React from 'react'
import { GenericFlowchart } from './GenericFlowchart'
import { LOOP_TEMPLATES } from '../templates'

interface WhileLoopFlowchartProps {
  scanData?: any
}

export const WhileLoopFlowchart: React.FC<WhileLoopFlowchartProps> = ({ scanData }) => {
  return (
    <GenericFlowchart
      templates={LOOP_TEMPLATES}
      title="Sélectionner un Modèle de Boucle"
      scanData={scanData}
      filterType="loop"
    />
  )
}
