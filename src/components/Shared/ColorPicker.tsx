import React, { useRef, useEffect } from 'react'
import styles from './ColorPicker.module.css'

interface PropsColorPicker {
  coresSugeridas: { nome: string; valor: string }[]
  corAtual: string
  onChange: (cor: string) => void
  onFechar: () => void
  x?: number
  y?: number
}

/**
 * Seletor de cores compacto com cores pré-definidas e entrada customizada.
 */
export const ColorPicker: React.FC<PropsColorPicker> = ({
  coresSugeridas,
  corAtual,
  onChange,
  onFechar,
  x = 0,
  y = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Delay para evitar que o click que abriu o picker feche imediatamente
    const timer = setTimeout(() => {
      const handleClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          onFechar()
        }
      }
      document.addEventListener('mousedown', handleClick)
      // Guardar ref para cleanup
      ;(ref as any)._cleanup = () => document.removeEventListener('mousedown', handleClick)
    }, 150)
    return () => {
      clearTimeout(timer)
      ;(ref as any)._cleanup?.()
    }
  }, [onFechar])

  const estilo = {
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 120),
  }

  return (
    <div ref={ref} className={styles.picker} style={estilo}>
      <div className={styles.cores}>
        {coresSugeridas.map((cor) => (
          <button
            key={cor.valor}
            className={`${styles.botaoCor} ${corAtual === cor.valor ? styles.botaoCorAtivo : ''}`}
            style={{ backgroundColor: cor.valor }}
            title={cor.nome}
            onClick={() => {
              onChange(cor.valor)
              onFechar()
            }}
          >
            {corAtual === cor.valor && (
              <svg viewBox="0 0 12 12" fill="white">
                <path d="M10 3L5 8.5 2 5.5l1-1 2 2 4-4.5L10 3z"/>
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Input de cor customizada */}
      <div className={styles.corCustomizada}>
        <input
          type="color"
          value={corAtual}
          onChange={(e) => onChange(e.target.value)}
          className={styles.inputCor}
          title="Cor personalizada"
        />
        <span className={styles.textoCustomizada}>Personalizada</span>
      </div>
    </div>
  )
}
