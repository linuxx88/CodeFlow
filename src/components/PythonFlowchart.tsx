import React from 'react'
import { GenericFlowchart } from './GenericFlowchart'
import { PYTHON_TEMPLATES } from '../templates'

interface PythonFlowchartProps {
  scanData?: any
}

export const PythonFlowchart: React.FC<PythonFlowchartProps> = ({ scanData }) => {
  return (
    <GenericFlowchart
      templates={PYTHON_TEMPLATES}
      title="Sélectionner un Script Python"
      scanData={scanData}
      filterType="python"
    />
  )
}
