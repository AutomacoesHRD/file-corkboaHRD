import React from 'react'
import { useAppStore } from '../../stores/appStore'
import { STRINGS } from '../../constants/strings'
import styles from './TabBar.module.css'

/**
 * Barra de abas: "Índice" e "Quadros".
 */
export const TabBar: React.FC = () => {
  const { abaAtiva, definirAbaAtiva, indexacao } = useAppStore()

  const totalArquivos = indexacao?.files.length ?? 0
  const totalQuadros = indexacao?.boards.length ?? 0

  return (
    <nav className={styles.tabBar}>
      <button
        className={`${styles.tab} ${abaAtiva === 'indice' ? styles.tabAtiva : ''}`}
        onClick={() => definirAbaAtiva('indice')}
      >
        {/* Ícone de Índice */}
        <svg viewBox="0 0 20 20" fill="currentColor" className={styles.tabIcon}>
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
        </svg>
        <span>{STRINGS.ABA_INDICE}</span>
        {totalArquivos > 0 && (
          <span className={styles.badge}>{totalArquivos}</span>
        )}
      </button>

      <button
        className={`${styles.tab} ${abaAtiva === 'quadros' ? styles.tabAtiva : ''}`}
        onClick={() => definirAbaAtiva('quadros')}
      >
        {/* Ícone de Quadros */}
        <svg viewBox="0 0 20 20" fill="currentColor" className={styles.tabIcon}>
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>
        </svg>
        <span>{STRINGS.ABA_QUADROS}</span>
        {totalQuadros > 0 && (
          <span className={styles.badge}>{totalQuadros}</span>
        )}
      </button>
    </nav>
  )
}
