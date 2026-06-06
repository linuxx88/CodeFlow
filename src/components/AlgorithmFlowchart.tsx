import React from 'react'
import { GenericFlowchart } from './GenericFlowchart'
import { ALGO_TEMPLATES } from '../templates'

interface AlgorithmFlowchartProps {
  scanData?: any
}

export const AlgorithmFlowchart: React.FC<AlgorithmFlowchartProps> = ({ scanData }) => {
  return (
    <GenericFlowchart
      templates={ALGO_TEMPLATES}
      title="Sélectionner un Algorithme"
      scanData={scanData}
      filterType="algo"
    />
  )
}
