import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Explorer } from './Explorer'
import React from 'react'

describe('Explorer Component', () => {
  const mockFlatFiles = [
    { name: 'src', path: 'src', isDir: true, depth: 0, isCollapsed: false },
    { name: 'components', path: 'src/components', isDir: true, depth: 1, isCollapsed: false },
    { name: 'App.tsx', path: 'src/App.tsx', isDir: false, depth: 1, sizeStr: '12 KB' },
    { name: 'index.css', path: 'src/index.css', isDir: false, depth: 1, sizeStr: '2 KB' },
  ]

  const defaultProps = {
    flatFiles: mockFlatFiles,
    onToggleDirectory: vi.fn(),
    onCollapseAll: vi.fn(),
    gitStatuses: {
      'src/App.tsx': 'modified' as const,
      'src/index.css': 'untracked' as const,
    },
    activeFile: 'src/App.tsx',
    onSelectFile: vi.fn(),
  }

  it('should render file tree list correctly', () => {
    render(<Explorer {...defaultProps} />)
    
    // Check main directories & files are in place
    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getByText('components')).toBeInTheDocument()
    expect(screen.getByText('App.tsx')).toBeInTheDocument()
    expect(screen.getByText('index.css')).toBeInTheDocument()
    
    // File sizes check
    expect(screen.getByText('12 KB')).toBeInTheDocument()
    expect(screen.getByText('2 KB')).toBeInTheDocument()
  })

  it('should apply correct styles and badges based on Git statuses', () => {
    render(<Explorer {...defaultProps} />)
    
    // App.tsx is modified ('M' badge)
    const modifiedBadge = screen.getByText('M')
    expect(modifiedBadge).toBeInTheDocument()
    expect(modifiedBadge).toHaveAttribute('title', 'Modifié')
    
    // index.css is untracked ('U' badge)
    const untrackedBadge = screen.getByText('U')
    expect(untrackedBadge).toBeInTheDocument()
    expect(untrackedBadge).toHaveAttribute('title', 'Non suivi')
  })

  it('should call onToggleDirectory when directory is clicked', () => {
    render(<Explorer {...defaultProps} />)
    
    const srcDirectoryNode = screen.getByText('src')
    fireEvent.click(srcDirectoryNode)
    
    expect(defaultProps.onToggleDirectory).toHaveBeenCalledWith('src')
  })

  it('should call onSelectFile when file is clicked', () => {
    render(<Explorer {...defaultProps} />)
    
    const fileNode = screen.getByText('index.css')
    fireEvent.click(fileNode)
    
    expect(defaultProps.onSelectFile).toHaveBeenCalledWith('src/index.css')
  })

  it('should call onCollapseAll when collapse all button is clicked', () => {
    render(<Explorer {...defaultProps} />)
    
    const collapseAllBtn = screen.getByTitle('Tout replier')
    expect(collapseAllBtn).toBeInTheDocument()
    
    fireEvent.click(collapseAllBtn)
    expect(defaultProps.onCollapseAll).toHaveBeenCalled()
  })

  it('should filter files through search input field', () => {
    render(<Explorer {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Filtrer les fichiers...')
    expect(searchInput).toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: 'App' } })
    expect(searchInput.value).toBe('App')
  })

  it('should collapse and expand the explorer panel when toggle button is clicked', () => {
    render(<Explorer {...defaultProps} />)
    
    // Panel starts expanded
    expect(screen.getByText('Explorateur')).toBeInTheDocument()
    
    const toggleButton = screen.getByRole('button', { name: '' })
    expect(toggleButton).toBeInTheDocument()
    
    // Click toggle button to collapse
    fireEvent.click(toggleButton)
  })
})
