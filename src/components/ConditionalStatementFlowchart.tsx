import React from 'react'
import { GenericFlowchart } from './GenericFlowchart'
import { CONDITIONAL_TEMPLATES } from '../templates'

interface ConditionalStatementFlowchartProps {
  scanData?: any
}

export const ConditionalStatementFlowchart: React.FC<ConditionalStatementFlowchartProps> = ({ scanData }) => {
  return (
    <GenericFlowchart
      templates={CONDITIONAL_TEMPLATES}
      title="Sélectionner un Modèle Conditionnel"
      scanData={scanData}
    />
  )
}
