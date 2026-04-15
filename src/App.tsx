import React, { useState, useEffect } from 'react'
import { useDataStore } from './hooks/useDataStore'
import { useFileSystem } from './hooks/useFileSystem'
import { useAppStore } from './stores/appStore'
import { Header } from './components/Layout/Header'
import { TabBar } from './components/Layout/TabBar'
import { SearchBar } from './components/Layout/SearchBar'
import { FileList } from './components/Index/FileList'
import { IndexarPastaDialog } from './components/Index/IndexarPastaDialog'
import { BoardList } from './components/Boards/BoardList'
import { BoardCanvas } from './components/Boards/BoardCanvas'
import styles from './App.module.css'

const App: React.FC = () => {
  const { carregado } = useDataStore()
  const { verificarEstadoArquivos } = useFileSystem()
  const { abaAtiva, quadroAtivoId, indexacao, master } = useAppStore()

  const [mostrarDialogoIndexar, setMostrarDialogoIndexar] = useState(false)

  const files = indexacao?.files ?? []

  // Verificar estado dos arquivos ao inicializar
  useEffect(() => {
    if (!carregado) return
    if (files.length === 0) return
    verificarEstadoArquivos()
  }, [carregado])

  if (!carregado) {
    return (
      <div className={styles.carregando}>
        <div className={styles.spinnerWrapper}>
          <svg viewBox="0 0 48 48" fill="none" className={styles.spinner}>
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" opacity="0.15"/>
            <path d="M24 4a20 20 0 0120 20" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span>Carregando CorkBoard...</span>
        </div>
      </div>
    )
  }

  const mostrarCanvas = abaAtiva === 'quadros' && quadroAtivoId !== null
  const temIndexacaoAtiva = master.activeIndexationId !== null

  return (
    <div className={styles.app}>
      <Header onIndexarPasta={() => setMostrarDialogoIndexar(true)} />
      <TabBar />

      <main className={styles.conteudo}>
        {abaAtiva === 'indice' && (
          <div className={styles.paginaIndice}>
            <SearchBar />
            <div className={styles.listaWrapper}>
              <FileList onIndexar={() => setMostrarDialogoIndexar(true)} />
            </div>
          </div>
        )}

        {abaAtiva === 'quadros' && (
          <div className={styles.paginaQuadros}>
            {mostrarCanvas && quadroAtivoId ? (
              <BoardCanvas quadroId={quadroAtivoId} />
            ) : (
              <BoardList />
            )}
          </div>
        )}
      </main>

      {mostrarDialogoIndexar && (
        <IndexarPastaDialog
          onFechar={() => setMostrarDialogoIndexar(false)}
          onConcluido={(qtd) => {
            setMostrarDialogoIndexar(false)
            if (qtd > 0 && abaAtiva !== 'indice') {
              useAppStore.getState().definirAbaAtiva('indice')
            }
          }}
        />
      )}
    </div>
  )
}

export default App
