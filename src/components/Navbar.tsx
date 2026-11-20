import React, { useState, useEffect, useRef } from 'react'
import { GitBranch, Play, ChevronDown, Palette, X } from 'lucide-react'
import { VIEW_OPTIONS, VIEW_CATEGORY_LABELS, getViewLabel } from '../constants/views'
import type { FlowchartView, ViewCategory } from '../constants/views'
import { HealthIndicator } from './HealthIndicator'

interface NavbarProps {
  projectPath: string
  setProjectPath: (val: string) => void
  isScanning: boolean
  onScan: () => void
  onCancel: () => void
  currentView: FlowchartView
  onViewChange: (view: FlowchartView) => void
  theme: 'dark' | 'light' | 'cyberpunk' | 'nord' | 'matrix'
  setTheme: (theme: 'dark' | 'light' | 'cyberpunk' | 'nord' | 'matrix') => void
}

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark', color: '#8b5cf6' },
  { value: 'light', label: 'Light', color: '#6366f1' },
  { value: 'cyberpunk', label: 'Cyberpunk', color: '#ff007f' },
  { value: 'nord', label: 'Nord', color: '#88c0d0' },
  { value: 'matrix', label: 'Matrix', color: '#00ff00' }
] as const

export const Navbar: React.FC<NavbarProps> = ({
  projectPath,
  setProjectPath,
  isScanning,
  onScan,
  onCancel,
  currentView,
  onViewChange,
  theme,
  setTheme
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false)
  const themeDropdownRef = useRef<HTMLDivElement>(null)
  const viewDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setIsThemeDropdownOpen(false)
      }
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeDropdownOpen(false)
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const canScan = !isScanning && projectPath.trim().length > 0

  return (
    <nav
      aria-label="Main navigation"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        zIndex: 200,
        boxShadow: '0 4px 20px var(--shadow)',
        transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s',
        overflow: 'visible',
        flexWrap: 'wrap',
        gap: '8px'
      }}
    >
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          flexShrink: 0
        }}
        onClick={() => onViewChange('all')}
      >
        <GitBranch size={18} color="var(--accent)" />
        <h1 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', margin: 0, letterSpacing: 'normal', whiteSpace: 'nowrap' }}>
          Interactive Dependency Flow
        </h1>
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          aria-label="Project path"
          placeholder="Enter project path..."
          value={projectPath}
          onChange={(e) => setProjectPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canScan) {
              onScan()
            }
          }}
          style={{
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text)',
            fontSize: '12px',
            width: '190px',
            outline: 'none',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            transition: 'border-color 0.2s, background-color 0.2s'
          }}
        />

        <HealthIndicator />

        {/* Theme Dropdown */}
        <div ref={themeDropdownRef} style={{ position: 'relative' }} onMouseLeave={() => setIsThemeDropdownOpen(false)}>
          <button
            type="button"
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            title="Change theme"
            aria-expanded={isThemeDropdownOpen}
            aria-haspopup="listbox"
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
            <ChevronDown size={12} style={{ display: 'inline-block', transform: isThemeDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {isThemeDropdownOpen && (
            <div
              role="listbox"
              aria-label="Select a theme"
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
                    type="button"
                    role="option"
                    aria-selected={isActive}
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
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
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
        <div ref={viewDropdownRef} style={{ position: 'relative' }} onMouseLeave={() => setIsDropdownOpen(false)}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
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
            <span>View: {getViewLabel(currentView)}</span>
            <ChevronDown size={14} style={{ display: 'inline-block', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {isDropdownOpen && (
            <div
              role="listbox"
              aria-label="Select a view"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                minWidth: '280px',
                width: 'max-content',
                maxHeight: 'calc(100vh - 70px)',
                overflowY: 'auto',
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
              {(['graph', 'code', 'overview'] as ViewCategory[]).map((category) => {
                const items = VIEW_OPTIONS.filter((opt) => opt.category === category)
                if (items.length === 0) return null
                return (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        padding: '3px 8px 1px'
                      }}
                    >
                      {VIEW_CATEGORY_LABELS[category]}
                    </div>
                    {items.map((opt) => {
                      const isActive = currentView === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            onViewChange(opt.value)
                            setIsDropdownOpen(false)
                          }}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                            color: isActive ? 'var(--accent-fg)' : 'var(--text)',
                            fontSize: '12px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <span style={{ fontWeight: isActive ? 600 : 500 }}>{opt.label}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: isActive ? 'var(--accent-fg)' : 'var(--text-muted)',
                              opacity: isActive ? 0.85 : 0.8
                            }}
                          >
                            {opt.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          id="Scanner"
          type="button"
          onClick={onScan}
          disabled={!canScan}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: canScan ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s',
            opacity: canScan ? 1 : 0.5
          }}
          onMouseEnter={(e) => {
            if (canScan) e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
          }}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          {isScanning ? (
            <span
              className="spinner"
              style={{
                width: '12px',
                height: '12px',
                border: '2px solid var(--accent-fg)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.6s linear infinite'
              }}
            ></span>
          ) : (
            <Play size={12} fill="currentColor" />
          )}
          <span>Scan</span>
        </button>

        {isScanning && (
          <button
            id="CancelScanner"
            type="button"
            onClick={onCancel}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--bottleneck-muted)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--bottleneck)',
              color: 'var(--bottleneck)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s, border-color 0.2s',
              marginLeft: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <X size={12} color="var(--bottleneck)" />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </nav>
  )
}
