import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GitPanel } from './GitPanel'
import React from 'react'

describe('GitPanel Component', () => {
  const mockHotspots = [
    { file: 'src/App.tsx', score: 85, commits: 15, authors: 3, percentage: 85, hasConflicts: false },
    { file: 'src/components/Explorer.tsx', score: 60, commits: 8, authors: 2, percentage: 60, hasConflicts: true },
  ]

  const defaultProps = {
    isGitRepo: true,
    hasGitData: true,
    gitSortBy: 'score' as const,
    setGitSortBy: vi.fn(),
    sortedGitHotspots: mockHotspots,
    onScan: vi.fn(),
    activeFile: 'src/App.tsx',
    onSelectFile: vi.fn(),
  }

  it('should render git hotspots lists correctly', () => {
    render(<GitPanel {...defaultProps} />)
    
    expect(screen.getByText('Friction Git / Hotspots')).toBeInTheDocument()
    
    // Sort modes buttons
    expect(screen.getByText('Score')).toBeInTheDocument()
    expect(screen.getByText('Modifications')).toBeInTheDocument()
    expect(screen.getByText('Auteurs')).toBeInTheDocument()
    
    // Check hotspot items content
    expect(screen.getByText('src/App.tsx')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument() // Score value
    expect(screen.getByText('15 modifs')).toBeInTheDocument()
    expect(screen.getByText('3 aut.')).toBeInTheDocument()
    
    // Conflict item check
    expect(screen.getByText('src/components/Explorer.tsx')).toBeInTheDocument()
    expect(screen.getByText('Conflict')).toBeInTheDocument()
  })

  it('should call setGitSortBy when sorting mode is clicked', () => {
    render(<GitPanel {...defaultProps} />)
    
    const modificationsBtn = screen.getByText('Modifications')
    fireEvent.click(modificationsBtn)
    
    expect(defaultProps.setGitSortBy).toHaveBeenCalledWith('commits')
  })

  it('should call onSelectFile when hotspot item is clicked', () => {
    render(<GitPanel {...defaultProps} />)
    
    const item = screen.getByText('src/components/Explorer.tsx')
    fireEvent.click(item)
    
    expect(defaultProps.onSelectFile).toHaveBeenCalledWith('src/components/Explorer.tsx')
  })

  it('should call onScan when scan button is clicked (if not conflicted)', () => {
    render(<GitPanel {...defaultProps} />)
    
    const scanButtons = screen.getAllByRole('button', { name: /Scanner/ })
    
    // First scan button (App.tsx)
    fireEvent.click(scanButtons[0])
    expect(defaultProps.onScan).toHaveBeenCalled()
  })

  it('should disable scan button for conflict files', () => {
    render(<GitPanel {...defaultProps} />)
    
    const scanButtons = screen.getAllByRole('button', { name: /Scanner/ })
    
    // Second scan button (Explorer.tsx - conflicted)
    expect(scanButtons[1]).toBeDisabled()
  })

  it('should display non-git repo message if isGitRepo is false', () => {
    render(<GitPanel {...defaultProps} isGitRepo={false} />)
    
    expect(screen.getByText('Dépôt Git non détecté.')).toBeInTheDocument()
    expect(screen.getByText('Initialisez Git pour suivre la friction des fichiers.')).toBeInTheDocument()
  })

  it('should display scan message if hasGitData is false', () => {
    render(<GitPanel {...defaultProps} hasGitData={false} />)
    
    expect(screen.getByText('Scannez le projet pour analyser l\'historique de friction Git.')).toBeInTheDocument()
  })
})
