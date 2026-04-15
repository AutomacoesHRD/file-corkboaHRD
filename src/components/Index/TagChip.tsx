import React, { useState, useRef } from 'react'
import styles from './TagChip.module.css'

interface PropsTagChip {
  tag: string
  onRemover: (tag: string) => void
}

interface PropsAdicionarTag {
  onAdicionar: (tag: string) => void
}

/**
 * Chip de tag editável.
 */
export const TagChip: React.FC<PropsTagChip> = ({ tag, onRemover }) => {
  return (
    <span className={styles.chip}>
      {tag}
      <button
        className={styles.botaoRemover}
        onClick={(e) => {
          e.stopPropagation()
          onRemover(tag)
        }}
        title={`Remover tag "${tag}"`}
      >
        <svg viewBox="0 0 10 10" fill="currentColor">
          <path d="M8 2L2 8M2 2l6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>
    </span>
  )
}

/**
 * Botão e input para adicionar nova tag.
 */
export const AdicionarTag: React.FC<PropsAdicionarTag> = ({ onAdicionar }) => {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const confirmar = () => {
    const tagLimpa = valor.trim()
    if (tagLimpa) {
      onAdicionar(tagLimpa)
    }
    setValor('')
    setEditando(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') confirmar()
    if (e.key === 'Escape') {
      setValor('')
      setEditando(false)
    }
  }

  if (editando) {
    return (
      <input
        ref={inputRef}
        className={styles.inputTag}
        placeholder="Nova tag..."
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={confirmar}
        autoFocus
        maxLength={30}
      />
    )
  }

  return (
    <button
      className={styles.botaoAdicionar}
      onClick={(e) => {
        e.stopPropagation()
        setEditando(true)
      }}
      title="Adicionar tag"
    >
      <svg viewBox="0 0 10 10" fill="currentColor">
        <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  )
}
