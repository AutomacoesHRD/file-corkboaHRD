import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../stores/appStore'
import { FileIcon } from '../Shared/FileIcon'
import styles from './FileSidebar.module.css'

interface PropsFileSidebar {
  visivel: boolean
  onToggle: () => void
  onAdicionarArquivo?: (fileId: string) => void
  mostrarNomeOriginal?: boolean
}

export const FileSidebar: React.FC<PropsFileSidebar> = ({ visivel, onToggle, onAdicionarArquivo, mostrarNomeOriginal = false }) => {
  const { indexacao } = useAppStore()
  const [busca, setBusca] = useState('')
  const [tagAtiva, setTagAtiva] = useState<string | null>(null)
  const [showTagMenu, setShowTagMenu] = useState(false)

  // Apenas arquivos "úteis" e não deletados
  const arquivosUteis = useMemo(() =>
    (indexacao?.files ?? []).filter(f => !f.isDeleted && f.category === 'useful'),
    [indexacao?.files]
  )

  // Tags disponíveis nos arquivos úteis
  const tagsDisponiveis = useMemo(() => {
    const map = new Map<string, number>()
    for (const f of arquivosUteis) {
      for (const t of f.tags) map.set(t, (map.get(t) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [arquivosUteis])

  // Filtrar por busca e tag
  const arquivosFiltrados = useMemo(() => {
    let list = arquivosUteis
    if (tagAtiva) {
      list = list.filter(f => f.tags.includes(tagAtiva))
    }
    if (busca.trim()) {
      const t = busca.toLowerCase()
      list = list.filter(f =>
        f.originalName.toLowerCase().includes(t) ||
        f.memorableName.toLowerCase().includes(t) ||
        f.tags.some(tag => tag.toLowerCase().includes(t))
      )
    }
    return list
  }, [arquivosUteis, busca, tagAtiva])

  const getNome = (f: { memorableName: string; originalName: string }) =>
    mostrarNomeOriginal ? f.originalName : (f.memorableName || f.originalName)

  return (
    <div className={`${styles.sidebar} ${visivel ? styles.visivel : styles.recolhido}`}>
      <button className={styles.botaoToggle} onClick={onToggle} title={visivel ? 'Recolher' : 'Expandir'}>
        <svg viewBox="0 0 10 16" fill="currentColor" style={{ transform: visivel ? 'rotate(180deg)' : 'none' }}>
          <path d="M0 8l6-8v5h4v6H6v5L0 8z"/>
        </svg>
      </button>

      {visivel && (
        <>
          <div className={styles.cabecalho}>
            <span className={styles.titulo}>ÚTEIS</span>
            <span className={styles.contagem}>{arquivosFiltrados.length}</span>
          </div>

          {/* Busca */}
          <div className={styles.busca}>
            <svg viewBox="0 0 14 14" fill="currentColor" className={styles.iconeLupa}>
              <path fillRule="evenodd" d="M6 2a4 4 0 100 8 4 4 0 000-8zM1 6a5 5 0 119.05 2.98l2.99 2.99a.75.75 0 11-1.06 1.06l-2.99-2.99A5 5 0 011 6z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar arquivo..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className={styles.inputBusca}
            />
            {busca && (
              <button className={styles.btnLimpar} onClick={() => setBusca('')}>×</button>
            )}
          </div>

          {/* Filtro de tags */}
          {tagsDisponiveis.length > 0 && (
            <div className={styles.tagRow}>
              <button
                className={`${styles.tagBtn} ${tagAtiva ? styles.tagBtnAtivo : ''}`}
                onClick={() => setShowTagMenu(!showTagMenu)}
              >
                {tagAtiva ?? 'Tags'} ▾
              </button>
              {tagAtiva && (
                <button className={styles.tagBtnClear} onClick={() => setTagAtiva(null)}>×</button>
              )}
              {showTagMenu && (
                <>
                  <div className={styles.tagOverlay} onClick={() => setShowTagMenu(false)} />
                  <div className={styles.tagDropdown}>
                    <button className={styles.tagItem} onClick={() => { setTagAtiva(null); setShowTagMenu(false) }}>
                      Todas
                    </button>
                    {tagsDisponiveis.map(([tag, count]) => (
                      <button key={tag} className={`${styles.tagItem} ${tagAtiva === tag ? styles.tagItemAtivo : ''}`}
                        onClick={() => { setTagAtiva(tag); setShowTagMenu(false) }}>
                        {tag} <span className={styles.tagCount}>{count}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Lista */}
          <div className={styles.lista}>
            {arquivosFiltrados.map(arquivo => (
              <div
                key={arquivo.id}
                className={styles.item}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('application/corkboard-file-id', arquivo.id)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                onClick={() => onAdicionarArquivo?.(arquivo.id)}
                title={`${arquivo.absolutePath}\nClique para adicionar ao quadro`}
              >
                <FileIcon extensao={arquivo.extension} tamanho={14} />
                <span className={styles.nomeItem}>{getNome(arquivo)}</span>
              </div>
            ))}
            {arquivosFiltrados.length === 0 && (
              <div className={styles.vazio}>
                {arquivosUteis.length === 0
                  ? 'Nenhum arquivo marcado como "Útil"'
                  : 'Nenhum resultado'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
