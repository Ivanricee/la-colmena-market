import { persistentAtom } from '@nanostores/persistent'

export type ThemeType = 'light' | 'dark'
export const $themeStore = persistentAtom<ThemeType>('color-theme', 'dark')

export const toggleTheme = () => {
  const currentTheme = $themeStore.get()
  $themeStore.set(currentTheme === 'light' ? 'dark' : 'light')
}
