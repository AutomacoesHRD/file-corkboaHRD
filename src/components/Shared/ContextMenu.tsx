import React, { useEffect, useRef } from 'react'
import styles from './ContextMenu.module.css'

export interface ItemMenuContexto {
  id: string
  label: string
  icone?: React.ReactNode
  perigo?: boolean
  separador?: boolean
  desabilitado?: boolean
}

interface PropsContextMenu {
  itens: ItemMenuContexto[]
  x: number
  y: number
  onFechar: () => void
  onSelecionar: (id: string) => void
}

/**
 * Menu de contexto customizado com estilo Fluent UI.
 * Posiciona-se automaticamente para não sair da tela.
 */
export const ContextMenu: React.FC<PropsContextMenu> = ({
  itens,
  x,
  y,
  onFechar,
  onSelecionar,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onFechar()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onFechar])

  // Calcular posição para não sair da tela
  const estiloMenu = {
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - itens.length * 36 - 16),
  }

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={estiloMenu}
      onContextMenu={(e) => e.preventDefault()}
    >
      {itens.map((item) =>
        item.separador ? (
          <div key={item.id} className={styles.separador} />
        ) : (
          <button
            key={item.id}
            className={`${styles.item} ${item.perigo ? styles.itemPerigo : ''}`}
            disabled={item.desabilitado}
            onClick={() => {
              onSelecionar(item.id)
              onFechar()
            }}
          >
            {item.icone && <span className={styles.icone}>{item.icone}</span>}
            <span className={styles.label}>{item.label}</span>
          </button>
        )
      )}
    </div>
  )
}

// Hook para gerenciar estado do menu de contexto
export function useContextMenu() {
  const [menu, setMenu] = React.useState<{
    visivel: boolean
    x: number
    y: number
    dados?: unknown
  }>({ visivel: false, x: 0, y: 0 })

  const abrirMenu = (e: React.MouseEvent, dados?: unknown) => {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ visivel: true, x: e.clientX, y: e.clientY, dados })
  }

  const fecharMenu = () => setMenu((m) => ({ ...m, visivel: false }))

  return { menu, abrirMenu, fecharMenu }
}
