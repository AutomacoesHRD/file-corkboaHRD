import { useAppStore } from '../stores/appStore'

export function useTheme() {
  const { master, alternarTema } = useAppStore()
  const tema = master.settings.theme

  return {
    tema,
    ehTemaEscuro: tema === 'dark',
    alternarTema,
  }
}
