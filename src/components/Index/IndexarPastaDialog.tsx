import React, { useState } from 'react'
import { useFileSystem } from '../../hooks/useFileSystem'
import { useAppStore } from '../../stores/appStore'
import { STRINGS } from '../../constants/strings'
import styles from './IndexarPastaDialog.module.css'

interface PropsIndexarPastaDialog {
  onFechar: () => void
  onConcluido: (quantidade: number) => void
}

type Passo = 'selecionar' | 'profundidade' | 'escaneando' | 'concluido'

const OPCOES_PROFUNDIDADE = [
  { label: STRINGS.PROFUNDIDADE_APENAS_RAIZ, valor: 0 },
  { label: STRINGS.PROFUNDIDADE_NIVEL(1), valor: 1 },
  { label: STRINGS.PROFUNDIDADE_NIVEL(2), valor: 2 },
  { label: STRINGS.PROFUNDIDADE_NIVEL(3), valor: 3 },
  { label: STRINGS.PROFUNDIDADE_NIVEL(4), valor: 4 },
  { label: STRINGS.PROFUNDIDADE_NIVEL(5), valor: 5 },
  { label: STRINGS.PROFUNDIDADE_TODAS, valor: -1 },
]

/**
 * Diálogo para selecionar pasta e profundidade de indexação.
 */
export const IndexarPastaDialog: React.FC<PropsIndexarPastaDialog> = ({ onFechar, onConcluido }) => {
  const { selecionarPasta, indexarPasta } = useFileSystem()
  const store = useAppStore()
  const [passo, setPasso] = useState<Passo>('selecionar')
  const [caminhoPasta, setCaminhoPasta] = useState('')
  const [profundidade, setProfundidade] = useState(2)
  const [erro, setErro] = useState('')
  const [quantidadeEncontrada, setQuantidadeEncontrada] = useState(0)

  const handleSelecionarPasta = async () => {
    const caminho = await selecionarPasta()
    if (!caminho) return
    setCaminhoPasta(caminho)
    setPasso('profundidade')
  }

  const handleIndexar = async () => {
    setPasso('escaneando')
    setErro('')
    try {
      // Se não há indexação ativa, criar uma automaticamente
      if (!store.master.activeIndexationId) {
        const nome = caminhoPasta.split(/[\\/]/).pop() || 'Minha Indexação'
        const nova = store.criarIndexacao(nome, caminhoPasta)
        // Salvar indexação vazia e trocar para ela
        await window.electronAPI.dataStore.saveIndexation(nova.id, {
          version: '1.0.0', indexedFolders: [], files: [], boards: [],
        })
        await window.electronAPI.dataStore.saveMaster(store.master)
        // Carregar a indexação vazia para que updateIdx funcione
        store.carregarIndexacao({ version: '1.0.0', indexedFolders: [], files: [], boards: [] })
      }

      const novosArquivos = await indexarPasta(caminhoPasta, profundidade)
      setQuantidadeEncontrada(novosArquivos.length)
      setPasso('concluido')
    } catch (e) {
      setErro(STRINGS.ERRO_ESCANEAR_PASTA + ' ' + String(e))
      setPasso('profundidade')
    }
  }

  const handleConcluir = () => {
    onConcluido(quantidadeEncontrada)
    onFechar()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className={styles.dialogo}>
        {/* Passo 1: Selecionar pasta */}
        {passo === 'selecionar' && (
          <>
            <div className={styles.icone}>
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="4" y="10" width="40" height="32" rx="4" fill="currentColor" opacity="0.1"/>
                <path d="M4 14h18l3 4h19v24H4V14z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="36" cy="36" r="10" fill="var(--accent-primary)"/>
                <path d="M32 36h8M36 32v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.titulo}>{STRINGS.INDEXAR_PASTA}</h2>
            <p className={styles.subtitulo}>Selecione uma pasta para indexar os arquivos.</p>
            <div className={styles.acoes}>
              <button className={styles.botaoCancelar} onClick={onFechar}>
                {STRINGS.CANCELAR}
              </button>
              <button className={styles.botaoPrimario} onClick={handleSelecionarPasta}>
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 4a2 2 0 012-2h3l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V4z"/>
                </svg>
                Selecionar Pasta
              </button>
            </div>
          </>
        )}

        {/* Passo 2: Profundidade */}
        {passo === 'profundidade' && (
          <>
            <div className={styles.caminhoPasta}>
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 3a2 2 0 012-2h2l2 2h4a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V3z"/>
              </svg>
              <span>{caminhoPasta}</span>
            </div>
            <h2 className={styles.titulo}>{STRINGS.PROFUNDIDADE_TITULO}</h2>
            <p className={styles.subtitulo}>{STRINGS.PROFUNDIDADE_PERGUNTA}</p>

            <div className={styles.gridProfundidade}>
              {OPCOES_PROFUNDIDADE.map((opcao) => (
                <button
                  key={opcao.valor}
                  className={`${styles.opcaoProfundidade} ${profundidade === opcao.valor ? styles.opcaoSelecionada : ''}`}
                  onClick={() => setProfundidade(opcao.valor)}
                >
                  {opcao.label}
                </button>
              ))}
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            <div className={styles.acoes}>
              <button className={styles.botaoCancelar} onClick={onFechar}>
                {STRINGS.CANCELAR}
              </button>
              <button className={styles.botaoPrimario} onClick={handleIndexar}>
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l1.4 2.8 3.1.5-2.2 2.2.5 3.1L8 8.2 5.4 9.6l.5-3.1L3.7 4.3l3.1-.5L8 1z"/>
                </svg>
                {STRINGS.PROFUNDIDADE_CONFIRMAR}
              </button>
            </div>
          </>
        )}

        {/* Passo 3: Escaneando */}
        {passo === 'escaneando' && (
          <div className={styles.escaneando}>
            <div className={styles.spinner}>
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
                <path d="M24 4a20 20 0 0120 20" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <p className={styles.textoEscaneando}>Escaneando arquivos...</p>
            <p className={styles.subtitulo}>{caminhoPasta}</p>
          </div>
        )}

        {/* Passo 4: Concluído */}
        {passo === 'concluido' && (
          <>
            <div className={`${styles.icone} ${styles.iconeSucesso}`}>
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="var(--cor-util)" opacity="0.15"/>
                <circle cx="24" cy="24" r="20" stroke="var(--cor-util)" strokeWidth="1.5"/>
                <path d="M15 24l7 7 11-14" stroke="var(--cor-util)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.titulo}>Indexação Concluída!</h2>
            <p className={styles.subtitulo}>
              {quantidadeEncontrada === 0
                ? 'Nenhum arquivo novo encontrado.'
                : `${quantidadeEncontrada} arquivo${quantidadeEncontrada !== 1 ? 's' : ''} novo${quantidadeEncontrada !== 1 ? 's' : ''} encontrado${quantidadeEncontrada !== 1 ? 's' : ''}.`}
            </p>
            <div className={styles.acoes}>
              <button className={styles.botaoPrimario} onClick={handleConcluir}>
                Ver Arquivos
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
