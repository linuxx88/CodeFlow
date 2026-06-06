import React from 'react'
import { GenericFlowchart } from './GenericFlowchart'
import { TEMPLATES } from '../templates'

interface IfThenFlowchartProps {
  scanData?: any
}

export const IfThenFlowchart: React.FC<IfThenFlowchartProps> = ({ scanData }) => {
  return (
    <GenericFlowchart
      templates={TEMPLATES}
      title="Sélectionner un Modèle"
      scanData={scanData}
      filterType="ifelse"
    />
  )
}
