import React, { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { useFileSystem } from '../../hooks/useFileSystem'
import { useAppStore } from '../../stores/appStore'
import { IndexationManager } from './IndexationManager'
import { STRINGS } from '../../constants/strings'
import styles from './Header.module.css'

interface PropsHeader {
  onIndexarPasta: () => void
}

/**
 * Barra superior da aplicação com título, controles de janela,
 * toggle de tema e botão de indexar pasta.
 * Segue o Windows 11 Fluent Design com área de arrasto (-webkit-app-region).
 */
export const Header: React.FC<PropsHeader> = ({ onIndexarPasta }) => {
  const { tema, ehTemaEscuro, alternarTema } = useTheme()
  const { verificarEstadoArquivos } = useFileSystem()
  const { indexacao } = useAppStore()
  const [reescaneando, setReescaneando] = useState(false)

  const handleReescanear = async () => {
    if (reescaneando) return
    setReescaneando(true)
    try {
      await verificarEstadoArquivos()
    } finally {
      setReescaneando(false)
    }
  }

  const temPastaIndexada = (indexacao?.indexedFolders.length ?? 0) > 0

  return (
    <header className={styles.header} data-theme={tema}>
      {/* Área de arrasto para mover a janela */}
      <div className={styles.dragArea} />

      {/* Ícone e título */}
      <div className={styles.titulo}>
        <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="18" rx="3" fill="currentColor" opacity="0.2"/>
          <rect x="2" y="3" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="17" cy="9" r="1.5" fill="currentColor"/>
          <line x1="7" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
          <line x1="12" y1="12" x2="17" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        </svg>
        <span className={styles.nomeTitulo}>{STRINGS.APP_NOME}</span>
      </div>

      {/* Seletor de Indexação */}
      <IndexationManager />

      {/* Ações */}
      <div className={styles.acoes}>
        {/* Reescanear */}
        {temPastaIndexada && (
          <button
            className={styles.botaoAcao}
            onClick={handleReescanear}
            disabled={reescaneando}
            title={STRINGS.REESCANEAR}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className={reescaneando ? styles.girandoIcon : ''}>
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd"/>
            </svg>
            <span>{STRINGS.REESCANEAR}</span>
          </button>
        )}

        {/* Indexar Pasta */}
        <button
          className={`${styles.botaoAcao} ${styles.botaoPrimario}`}
          onClick={onIndexarPasta}
          title={STRINGS.INDEXAR_PASTA}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            <path d="M10 9a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1v-1a1 1 0 011-1z" fill="white"/>
          </svg>
          <span>{STRINGS.INDEXAR_PASTA}</span>
        </button>

        {/* Toggle de Tema */}
        <button
          className={styles.botaoIcone}
          onClick={alternarTema}
          title={ehTemaEscuro ? STRINGS.TEMA_CLARO : STRINGS.TEMA_ESCURO}
        >
          {ehTemaEscuro ? (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Controles da Janela */}
      <div className={styles.controles}>
        <button
          className={`${styles.botaoJanela} ${styles.botaoMinimizar}`}
          onClick={() => window.electronAPI.window.minimize()}
          aria-label="Minimizar"
        >
          <svg viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1"/>
          </svg>
        </button>
        <button
          className={`${styles.botaoJanela} ${styles.botaoMaximizar}`}
          onClick={() => window.electronAPI.window.maximize()}
          aria-label="Maximizar"
        >
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9"/>
          </svg>
        </button>
        <button
          className={`${styles.botaoJanela} ${styles.botaoFechar}`}
          onClick={() => window.electronAPI.window.close()}
          aria-label="Fechar"
        >
          <svg viewBox="0 0 10 10" fill="currentColor">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
