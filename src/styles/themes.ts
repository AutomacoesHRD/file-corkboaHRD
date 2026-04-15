/**
 * Definições de tema para uso programático.
 * Os temas são aplicados via atributo data-theme no elemento :root.
 */

export type Tema = 'dark' | 'light'

export function aplicarTema(tema: Tema): void {
  document.documentElement.setAttribute('data-theme', tema)
}

export function obterTemaAtual(): Tema {
  return (document.documentElement.getAttribute('data-theme') as Tema) ?? 'dark'
}

// Cores de cortiça para o canvas do quadro (mantidas em ambos os temas)
export const COR_CORTICA = {
  dark: {
    fundo: '#8B6914',
    sombra: 'rgba(0,0,0,0.6)',
    textura1: '#7A5C10',
    textura2: '#9A7520',
    textura3: '#6B4F0E',
  },
  light: {
    fundo: '#C4922A',
    sombra: 'rgba(0,0,0,0.3)',
    textura1: '#B5841F',
    textura2: '#D3A030',
    textura3: '#A0721A',
  },
}
