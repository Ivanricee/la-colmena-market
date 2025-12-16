type Theme = 'light' | 'dark'

let clickListenerBound = false
let mediaListenerBound = false

function readStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null
  const value = localStorage.getItem('color-theme')
  if (value === 'dark' || value === 'light') return value
  return null
}

function applyStoredTheme(): void {
  const stored = readStoredTheme()
  // Default: light mode when there is no preference
  if (stored === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

/**
 * Aplica el tema al documento
 */
function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('color-theme', theme)
  }
}

/**
 * Inicializa el toggle de dark mode
 */
export default function toggleDarkMode(): void {
  const themeToggleBtn = document.getElementById('theme-toggle')
  const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon')
  const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon')

  // Validación estricta de elementos
  if (!themeToggleBtn || !themeToggleDarkIcon || !themeToggleLightIcon) {
    // Si el toggle no existe en esta página, no hacemos nada.
  }

  /**
   * Actualiza los iconos según el tema actual
   */
  function updateIcons(): void {
    const darkIcon = document.getElementById('theme-toggle-dark-icon')
    const lightIcon = document.getElementById('theme-toggle-light-icon')
    if (!darkIcon || !lightIcon) return

    const isDark = document.documentElement.classList.contains('dark')

    if (isDark) {
      lightIcon.classList.remove('hidden')
      darkIcon.classList.add('hidden')
    } else {
      darkIcon.classList.remove('hidden')
      lightIcon.classList.add('hidden')
    }
  }

  /**
   * Handler del click en el botón
   */
  function handleToggle(): void {
    const isDark = document.documentElement.classList.contains('dark')
    const newTheme: Theme = isDark ? 'light' : 'dark'

    applyTheme(newTheme)
    updateIcons()
  }

  // Inicializar iconos en el estado correcto
  applyStoredTheme()
  updateIcons()

  // Remover listener previo para evitar acumulación
  if (!clickListenerBound) {
    clickListenerBound = true
    document.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const btn = target.closest('#theme-toggle')
      if (!btn) return
      handleToggle()
    })
  }

  // Escuchar cambios en preferencias del sistema (opcional)
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (e: MediaQueryListEvent): void => {
      // Solo actualizar si no hay preferencia guardada
      if (!localStorage.getItem('color-theme')) {
        const newTheme: Theme = e.matches ? 'dark' : 'light'
        applyTheme(newTheme)
        updateIcons()
      }
    }

    if (!mediaListenerBound) {
      mediaListenerBound = true
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
  }
}
