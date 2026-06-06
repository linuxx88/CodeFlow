import React, { useState } from 'react'
import { GitBranch, Play, ChevronDown, Palette } from 'lucide-react'
import { VIEW_OPTIONS, getViewLabel } from '../constants/views'
import type { FlowchartView } from '../constants/views'

interface NavbarProps {
  projectPath: string
  setProjectPath: (val: string) => void
  isScanning: boolean
  onScan: () => void
  currentView: FlowchartView
  onViewChange: (view: FlowchartView) => void
  theme: 'dark' | 'light' | 'cyberpunk' | 'nord' | 'matrix'
  setTheme: (theme: 'dark' | 'light' | 'cyberpunk' | 'nord' | 'matrix') => void
}

const THEME_OPTIONS = [
  { value: 'dark', label: 'Sombre', color: '#8b5cf6' },
  { value: 'light', label: 'Clair', color: '#6366f1' },
  { value: 'cyberpunk', label: 'Cyberpunk', color: '#ff007f' },
  { value: 'nord', label: 'Nord', color: '#88c0d0' },
  { value: 'matrix', label: 'Matrix', color: '#00ff00' }
] as const

export const Navbar: React.FC<NavbarProps> = ({
  projectPath,
  setProjectPath,
  isScanning,
  onScan,
  currentView,
  onViewChange,
  theme,
  setTheme
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
        boxShadow: '0 4px 20px var(--shadow)',
        transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s'
      }}
    >
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        onClick={() => onViewChange('all')}
      >
        <GitBranch size={20} color="var(--accent)" />
        <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', margin: 0, letterSpacing: 'normal' }}>
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
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text)',
            fontSize: '13px',
            width: '240px',
            outline: 'none',
            transition: 'border-color 0.2s, background-color 0.2s'
          }}
        />

        {/* Theme Dropdown */}
        <div style={{ position: 'relative' }} onMouseLeave={() => setIsThemeDropdownOpen(false)}>
          <button
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            title="Changer le thème"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
          >
            <Palette size={14} color="var(--accent)" />
            <span style={{ textTransform: 'capitalize' }}>{theme}</span>
            <ChevronDown size={12} style={{ transform: isThemeDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {isThemeDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: '160px',
                backgroundColor: 'var(--dropdown-bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px var(--shadow)',
                backdropFilter: 'blur(12px)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100
              }}
            >
              {THEME_OPTIONS.map((opt) => {
                const isActive = theme === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTheme(opt.value)
                      setIsThemeDropdownOpen(false)
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
                      color: isActive ? 'var(--text)' : 'var(--text-muted)',
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s',
                      fontWeight: isActive ? 600 : 400
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: opt.color, display: 'inline-block' }}></span>
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Dropdown for Flowchart Type */}
        <div style={{ position: 'relative' }} onMouseLeave={() => setIsDropdownOpen(false)}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text)',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s, border-color 0.2s'
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
                width: '240px',
                backgroundColor: 'var(--dropdown-bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px var(--shadow)',
                backdropFilter: 'blur(12px)',
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
                      color: isActive ? '#fff' : 'var(--text)',
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontWeight: isActive ? 600 : 400
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
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
            gap: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
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
