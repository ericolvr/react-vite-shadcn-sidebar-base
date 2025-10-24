import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Verifica se o HTML tem a classe 'dark' ao carregar
    const htmlElement = document.documentElement
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      const isThemeDark = savedTheme === 'dark'
      setIsDark(isThemeDark)
      if (isThemeDark) {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }
    } else {
      // Se não há tema salvo, verifica a classe atual
      setIsDark(htmlElement.classList.contains('dark'))
    }
  }, [])

  const toggleTheme = () => {
    const htmlElement = document.documentElement
    const newTheme = !isDark
    
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    if (newTheme) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
