type Theme = 'light' | 'dark'

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
    console.warn('Dark mode toggle: Required elements not found in DOM', {
      button: !!themeToggleBtn,
      darkIcon: !!themeToggleDarkIcon,
      lightIcon: !!themeToggleLightIcon,
    })
    return
  }

  /**
   * Actualiza los iconos según el tema actual
   */
  function updateIcons(): void {
    const isDark = document.documentElement.classList.contains('dark')

    if (isDark) {
      themeToggleLightIcon!.classList.remove('hidden')
      themeToggleDarkIcon!.classList.add('hidden')
    } else {
      themeToggleDarkIcon!.classList.remove('hidden')
      themeToggleLightIcon!.classList.add('hidden')
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
  updateIcons()

  // Remover listener previo para evitar acumulación
  themeToggleBtn.removeEventListener('click', handleToggle)
  themeToggleBtn.addEventListener('click', handleToggle)

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

    mediaQuery.removeEventListener('change', handleSystemThemeChange)
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }
}
