import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light' | 'cyberpunk' | 'nord' | 'matrix'

const THEMES: Theme[] = ['dark', 'light', 'cyberpunk', 'nord', 'matrix']

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme') as Theme
    if (THEMES.includes(saved)) {
      return saved
    }
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem('app-theme', theme)
    const root = document.documentElement
    THEMES.forEach(t => {
      root.classList.remove(`theme-${t}`)
    })
    root.classList.add(`theme-${theme}`)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      const idx = THEMES.indexOf(prev)
      const nextIdx = (idx + 1) % THEMES.length
      return THEMES[nextIdx]
    })
  }

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}

