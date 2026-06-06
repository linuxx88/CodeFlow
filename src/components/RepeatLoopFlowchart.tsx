import React from 'react'
import { GenericFlowchart } from './GenericFlowchart'
import { REPEAT_TEMPLATES } from '../templates'

interface RepeatLoopFlowchartProps {
  scanData?: any
}

export const RepeatLoopFlowchart: React.FC<RepeatLoopFlowchartProps> = ({ scanData }) => {
  return (
    <GenericFlowchart
      templates={REPEAT_TEMPLATES}
      title="Sélectionner un Modèle Repeat (Do-While)"
      scanData={scanData}
      filterType="repeat"
    />
  )
}
