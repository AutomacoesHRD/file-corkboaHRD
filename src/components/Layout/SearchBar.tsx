import React, { useMemo, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { CategoriaArquivo } from '../../types'
import { STRINGS } from '../../constants/strings'
import styles from './SearchBar.module.css'

export const SearchBar: React.FC = () => {
  const {
    termoBusca,
    filtroCategoria,
    modoOrdenacao,
    indexacao,
    definirTermoBusca,
    definirFiltroCategoria,
    definirModoOrdenacao,
  } = useAppStore()

  const files = indexacao?.files ?? []

  const [filtroTag, setFiltroTag] = useState<string | null>(null)
  const [mostrarMenuTags, setMostrarMenuTags] = useState(false)

  // Coletar todas as tags únicas dos arquivos
  const todasTags = useMemo(() => {
    const tags = new Map<string, number>()
    for (const f of files) {
      if (f.isDeleted) continue
      for (const t of f.tags) {
        tags.set(t, (tags.get(t) ?? 0) + 1)
      }
    }
    return Array.from(tags.entries()).sort((a, b) => b[1] - a[1])
  }, [files])

  // Ao selecionar uma tag, aplicamos como termo de busca
  const selecionarTag = (tag: string | null) => {
    setFiltroTag(tag)
    if (tag) {
      definirTermoBusca(tag)
    } else {
      definirTermoBusca('')
    }
    setMostrarMenuTags(false)
  }

  // Copiar caminhos de uma tag
  const copiarCaminhosTag = async () => {
    if (!filtroTag) return
    const arquivos = files.filter(f => !f.isDeleted && f.tags.includes(filtroTag))
    const caminhos = arquivos.map(f => f.absolutePath).join('\n')
    await navigator.clipboard.writeText(caminhos)
    alert(`${arquivos.length} caminhos copiados para a área de transferência!`)
  }

  // Abrir todos os arquivos de uma tag
  const abrirTodosTag = () => {
    if (!filtroTag) return
    const arquivos = files.filter(f => !f.isDeleted && f.tags.includes(filtroTag))
    for (const f of arquivos) {
      window.electronAPI.shell.openPath(f.absolutePath)
    }
  }

  const filtros: { label: string; valor: CategoriaArquivo | 'all' }[] = [
    { label: 'Todos', valor: 'all' },
    { label: STRINGS.CATEGORIA_UTIL, valor: 'useful' },
    { label: STRINGS.CATEGORIA_POTENCIAL, valor: 'potential' },
    { label: STRINGS.CATEGORIA_SEM_UTILIDADE, valor: 'useless' },
  ]

  return (
    <div className={styles.container}>
      {/* Campo de busca */}
      <div className={styles.campoBusca}>
        <svg viewBox="0 0 20 20" fill="currentColor" className={styles.iconeLupa}>
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
        </svg>
        <input
          type="text"
          className={styles.input}
          placeholder={STRINGS.INDICE_BUSCA_PLACEHOLDER}
          value={termoBusca}
          onChange={(e) => {
            definirTermoBusca(e.target.value)
            if (filtroTag && e.target.value !== filtroTag) setFiltroTag(null)
          }}
        />
        {termoBusca && (
          <button
            className={styles.botaoLimpar}
            onClick={() => { definirTermoBusca(''); setFiltroTag(null) }}
            title="Limpar busca"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filtros por categoria */}
      <div className={styles.filtros}>
        {filtros.map((filtro) => (
          <button
            key={filtro.valor}
            className={`${styles.botaoFiltro} ${filtroCategoria === filtro.valor ? styles.botaoFiltroAtivo : ''}`}
            onClick={() => definirFiltroCategoria(filtro.valor)}
          >
            {filtro.valor === 'useful' && <span className={`${styles.dot} ${styles.dotUtil}`}/>}
            {filtro.valor === 'potential' && <span className={`${styles.dot} ${styles.dotPotencial}`}/>}
            {filtro.valor === 'useless' && <span className={`${styles.dot} ${styles.dotSemUtilidade}`}/>}
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Filtro por tag */}
      {todasTags.length > 0 && (
        <div className={styles.tagFilterWrapper}>
          <button
            className={`${styles.botaoFiltro} ${filtroTag ? styles.botaoFiltroAtivo : ''}`}
            onClick={() => setMostrarMenuTags(!mostrarMenuTags)}
          >
            <svg viewBox="0 0 14 14" fill="currentColor" style={{ width: 11, height: 11 }}>
              <path d="M1 1h5.5L13 7.5 7.5 13 1 6.5V1zm3 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
            </svg>
            {filtroTag ?? 'Tags'}
          </button>

          {/* Se tag ativa, mostrar botões de ação */}
          {filtroTag && (
            <>
              <button
                className={styles.botaoCopiarTag}
                onClick={abrirTodosTag}
                title={`Abrir todos os arquivos com tag "${filtroTag}"`}
              >
                <svg viewBox="0 0 14 14" fill="currentColor" style={{ width: 12, height: 12 }}>
                  <path d="M2 3a2 2 0 012-2h3l2 2h3a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V3z"/>
                </svg>
              </button>
              <button
                className={styles.botaoCopiarTag}
                onClick={copiarCaminhosTag}
                title={`Copiar caminhos de todos os arquivos com tag "${filtroTag}"`}
              >
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: 12, height: 12 }}>
                  <rect x="4" y="4" width="8" height="8" rx="1.5"/>
                  <path d="M10 4V2.5A1.5 1.5 0 008.5 1h-6A1.5 1.5 0 001 2.5v6A1.5 1.5 0 002.5 10H4"/>
                </svg>
              </button>
            </>
          )}

          {/* Dropdown de tags */}
          {mostrarMenuTags && (
            <>
              <div className={styles.tagOverlay} onClick={() => setMostrarMenuTags(false)} />
              <div className={styles.tagDropdown}>
                <button
                  className={`${styles.tagItem} ${!filtroTag ? styles.tagItemAtivo : ''}`}
                  onClick={() => selecionarTag(null)}
                >
                  Todas
                </button>
                {todasTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    className={`${styles.tagItem} ${filtroTag === tag ? styles.tagItemAtivo : ''}`}
                    onClick={() => selecionarTag(tag)}
                  >
                    <span>{tag}</span>
                    <span className={styles.tagCount}>{count}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle de ordenação */}
      <button
        className={styles.botaoOrdenacao}
        onClick={() => definirModoOrdenacao(modoOrdenacao === 'manual' ? 'alphabetical' : 'manual')}
        title={modoOrdenacao === 'manual' ? 'Alternar para ordem alfabética' : 'Alternar para ordem manual'}
      >
        {modoOrdenacao === 'manual' ? (
          <>
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4h12v1.5H2V4zm2 3.5h8V9H4V7.5zm2 3.5h4v1.5H6V11z"/>
            </svg>
            <span>{STRINGS.INDICE_ORDEM_MANUAL}</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 4l3-3 3 3H5zm5 8l-3 3-3-3h6z"/>
            </svg>
            <span>{STRINGS.INDICE_ORDEM_ALFABETICA}</span>
          </>
        )}
      </button>
    </div>
  )
}
