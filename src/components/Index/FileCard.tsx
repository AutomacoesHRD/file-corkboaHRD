import React, { useState, useRef } from 'react'
import { ArquivoIndexado, CategoriaArquivo } from '../../types'
import { useAppStore } from '../../stores/appStore'
import { useFileSystem } from '../../hooks/useFileSystem'
import { FileIcon } from '../Shared/FileIcon'
import { TagChip, AdicionarTag } from './TagChip'
import { STRINGS } from '../../constants/strings'
import styles from './FileCard.module.css'

interface PropsFileCard {
  arquivo: ArquivoIndexado
  arrastavel?: boolean
}

export const FileCard: React.FC<PropsFileCard> = ({ arquivo, arrastavel = false }) => {
  const { atualizarArquivo } = useAppStore()
  const { abrirArquivo, revincularArquivo } = useFileSystem()
  const [editandoNome, setEditandoNome] = useState(false)
  const [nomeTemp, setNomeTemp] = useState(arquivo.memorableName)
  const inputNomeRef = useRef<HTMLInputElement>(null)

  // Duplo-clique no card = abrir arquivo
  const handleDuploClique = () => {
    if (arquivo.isDeleted || editandoNome) return
    abrirArquivo(arquivo.absolutePath)
  }

  // Clique simples no nome = editar
  const handleCliqueNome = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNomeTemp(arquivo.memorableName)
    setEditandoNome(true)
    setTimeout(() => inputNomeRef.current?.select(), 50)
  }

  const confirmarNome = () => {
    atualizarArquivo(arquivo.id, { memorableName: nomeTemp.trim() })
    setEditandoNome(false)
  }

  const handleKeyDownNome = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') confirmarNome()
    if (e.key === 'Escape') {
      setNomeTemp(arquivo.memorableName)
      setEditandoNome(false)
    }
  }

  const handleCategoria = (e: React.MouseEvent, categoria: CategoriaArquivo) => {
    e.stopPropagation()
    atualizarArquivo(arquivo.id, { category: categoria })
  }

  const handleAdicionarTag = (tag: string) => {
    if (!arquivo.tags.includes(tag)) {
      atualizarArquivo(arquivo.id, { tags: [...arquivo.tags, tag] })
    }
  }

  const handleRemoverTag = (tag: string) => {
    atualizarArquivo(arquivo.id, { tags: arquivo.tags.filter((t) => t !== tag) })
  }

  const handleRevincular = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await revincularArquivo(arquivo.id)
  }

  const classeCard = [
    styles.card,
    arquivo.isDeleted ? styles.cardDeletado : '',
    arquivo.needsRelink ? styles.cardMovido : '',
    arquivo.category === 'useless' ? styles.cardSemUtilidade : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classeCard}
      onDoubleClick={handleDuploClique}
      title={arquivo.isDeleted ? STRINGS.CARD_TOOLTIP_DELETADO : `Duplo-clique para abrir: ${arquivo.absolutePath}`}
      draggable={arrastavel && !arquivo.isDeleted}
      onDragStart={(e) => {
        if (arrastavel) {
          e.dataTransfer.setData('application/corkboard-file-id', arquivo.id)
          e.dataTransfer.effectAllowed = 'copy'
        }
      }}
    >
      {/* Linha 1: ícone + nome editável + nome original + badge extensão */}
      <div className={styles.linha1}>
        <div className={styles.iconeWrapper}>
          <FileIcon extensao={arquivo.extension} tamanho={20} />
          {arquivo.isDeleted && (
            <span className={styles.iconeDeletado}>
              <svg viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1l5 10H1L6 1zm0 3v4m0 1.5v.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          )}
        </div>

        <div className={styles.nomes}>
          {editandoNome ? (
            <input
              ref={inputNomeRef}
              className={styles.inputNome}
              value={nomeTemp}
              onChange={(e) => setNomeTemp(e.target.value)}
              onKeyDown={handleKeyDownNome}
              onBlur={confirmarNome}
              onClick={(e) => e.stopPropagation()}
              placeholder={arquivo.originalName}
              maxLength={100}
            />
          ) : (
            <span
              className={`${styles.nomeMemoravel} ${!arquivo.memorableName ? styles.nomePlaceholder : ''}`}
              onClick={handleCliqueNome}
              title="Clique para nomear"
            >
              {arquivo.memorableName || STRINGS.CARD_NOMEAR_PLACEHOLDER}
            </span>
          )}
          <span className={styles.separadorNome}>—</span>
          <span className={styles.nomeOriginal} title={arquivo.absolutePath}>{arquivo.originalName}</span>
        </div>

        <span className={styles.badgeExtensao}>{arquivo.extension || '?'}</span>
      </div>

      {/* Linha 2: categoria + tags + status */}
      <div className={styles.linha2} onClick={(e) => e.stopPropagation()}>
        {/* Categorias */}
        <div className={styles.seletorCategoria}>
          <button
            className={`${styles.btnCat} ${arquivo.category === 'useful' ? styles.catUtil : ''}`}
            onClick={(e) => handleCategoria(e, 'useful')}
            title={STRINGS.CATEGORIA_UTIL}
          >
            <svg viewBox="0 0 12 12"><path d="M6 1l1.4 2.8 3.1.5-2.2 2.2.5 3.1L6 8.2 3.2 9.6l.5-3.1L1.5 4.3l3.1-.5L6 1z" fill="currentColor"/></svg>
          </button>
          <button
            className={`${styles.btnCat} ${arquivo.category === 'potential' ? styles.catPotencial : ''}`}
            onClick={(e) => handleCategoria(e, 'potential')}
            title={STRINGS.CATEGORIA_POTENCIAL}
          >
            <svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
          <button
            className={`${styles.btnCat} ${arquivo.category === 'useless' ? styles.catSemUtil : ''}`}
            onClick={(e) => handleCategoria(e, 'useless')}
            title={STRINGS.CATEGORIA_SEM_UTILIDADE}
          >
            <svg viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className={styles.divider} />

        {/* Tags */}
        <div className={styles.tags}>
          {arquivo.tags.map((tag) => (
            <TagChip key={tag} tag={tag} onRemover={handleRemoverTag} />
          ))}
          <AdicionarTag onAdicionar={handleAdicionarTag} />
        </div>

        {/* Status (movido/deletado) */}
        {arquivo.isDeleted && (
          <span className={styles.statusDeletado} title={STRINGS.CARD_ARQUIVO_NAO_ENCONTRADO}>!</span>
        )}
        {arquivo.needsRelink && !arquivo.isDeleted && (
          <button className={styles.botaoRevincular} onClick={handleRevincular} title={STRINGS.CARD_REVINCULAR}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M8.5 5.5L11 3m0 0l-2-2m2 2H9M5.5 8.5L3 11m0 0l2 2M3 11h2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
