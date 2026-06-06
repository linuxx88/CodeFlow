import React, { useState } from 'react'
import { GitBranch, Play, ChevronDown } from 'lucide-react'
import { VIEW_OPTIONS, getViewLabel } from '../constants/views'
import type { FlowchartView } from '../constants/views'

interface NavbarProps {
  projectPath: string
  setProjectPath: (val: string) => void
  isScanning: boolean
  onScan: () => void
  currentView: FlowchartView
  onViewChange: (view: FlowchartView) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  projectPath,
  setProjectPath,
  isScanning,
  onScan,
  currentView,
  onViewChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 10
      }}
    >
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        onClick={() => onViewChange('all')}
      >
        <GitBranch size={20} color="var(--accent)" />
        <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: 0, letterSpacing: 'normal' }}>
          Interactive Dependency Flow
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          type="text"
          placeholder="Entrez le chemin du projet..."
          value={projectPath}
          onChange={(e) => setProjectPath(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            color: '#fff',
            fontSize: '13px',
            width: '240px',
            outline: 'none'
          }}
        />

        {/* Dropdown for Flowchart Type */}
        <div style={{ position: 'relative' }} onMouseLeave={() => setIsDropdownOpen(false)}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(255,255,255,0.03)',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
          >
            <span>Type de Flowchart : {getViewLabel(currentView)}</span>
            <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '240px',
                backgroundColor: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100
              }}
            >
              {VIEW_OPTIONS.map((opt) => {
                const isActive = currentView === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onViewChange(opt.value)
                      setIsDropdownOpen(false)
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                      color: '#fff',
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontWeight: isActive ? 600 : 400
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={onScan}
          disabled={isScanning}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isScanning ? (
            <span
              className="spinner"
              style={{
                width: '12px',
                height: '12px',
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.6s linear infinite'
              }}
            ></span>
          ) : (
            <Play size={12} fill="currentColor" />
          )}
          <span>Scanner</span>
        </button>
      </div>
    </div>
  )
}
