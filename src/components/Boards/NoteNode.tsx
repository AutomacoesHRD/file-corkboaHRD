import React, { useState, useRef } from 'react'
import { ItemNotaQuadro } from '../../types'
import { ContextMenu, ItemMenuContexto, useContextMenu } from '../Shared/ContextMenu'
import { ColorPicker } from '../Shared/ColorPicker'
import { useAppStore } from '../../stores/appStore'
import { CORES_NOTA } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import styles from './BoardNode.module.css'

interface PropsNoteNode {
  item: ItemNotaQuadro
  quadroId: string
  selecionado: boolean
  escala: number
  onIniciarConexao: (itemId: string, x: number, y: number) => void
  onSelecionar: (id: string) => void
}

/**
 * Representação de uma nota/post-it no canvas do quadro.
 */
export const NoteNode: React.FC<PropsNoteNode> = ({
  item,
  quadroId,
  selecionado,
  escala,
  onIniciarConexao,
  onSelecionar,
}) => {
  const { atualizarItemQuadro, removerItemDoQuadro } = useAppStore()
  const { menu, abrirMenu, fecharMenu } = useContextMenu()
  const [editando, setEditando] = useState(item.content === '')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [corPickerPos, setCorPickerPos] = useState({ x: 0, y: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleDuploClique = () => {
    setEditando(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const handleBlur = () => {
    setEditando(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    atualizarItemQuadro(quadroId, item.id, { content: e.target.value })
  }

  // Calcular cor do texto (escuro para fundos claros, claro para escuros)
  const corTexto = obterCorTexto(item.color)

  const itensMenu: ItemMenuContexto[] = [
    {
      id: 'editar',
      label: STRINGS.CANVAS_NOTA_PLACEHOLDER,
      icone: <svg viewBox="0 0 14 14" fill="currentColor"><path d="M10.7 2.3a1 1 0 011.4 1.4L5.5 10.3l-2.2.5.5-2.2L10.7 2.3z"/></svg>,
    },
    {
      id: 'alterar-cor',
      label: STRINGS.CANVAS_ALTERAR_COR,
      icone: <svg viewBox="0 0 14 14" fill="currentColor"><circle cx="7" cy="7" r="5" fill={item.color}/></svg>,
    },
    { id: 'sep', label: '', separador: true },
    {
      id: 'remover',
      label: STRINGS.CARD_REMOVER_QUADRO,
      perigo: true,
      icone: <svg viewBox="0 0 14 14" fill="currentColor"><path d="M4 2L10 8M10 2L4 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    },
  ]

  const handleMenuSelecionar = (acao: string) => {
    switch (acao) {
      case 'editar':
        handleDuploClique()
        break
      case 'alterar-cor':
        setCorPickerPos({ x: menu.x, y: menu.y })
        setShowColorPicker(true)
        break
      case 'remover':
        removerItemDoQuadro(quadroId, item.id)
        break
    }
  }

  return (
    <>
      <div
        className={`${styles.noteNode} ${selecionado ? styles.selecionado : ''}`}
        style={{ backgroundColor: item.color, color: corTexto }}
        onDoubleClick={handleDuploClique}
        onContextMenu={(e) => {
          e.stopPropagation()
          abrirMenu(e)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelecionar(item.id)
        }}
      >
        {editando ? (
          <textarea
            ref={textareaRef}
            className={styles.textareaNota}
            style={{ color: corTexto }}
            value={item.content}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={STRINGS.CANVAS_NOTA_PLACEHOLDER}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditando(false)
                e.stopPropagation()
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className={styles.conteudoNota}>
            {item.content || (
              <span style={{ opacity: 0.5 }}>Clique duplo para editar...</span>
            )}
          </div>
        )}

        {/* Pontos de conexão */}
        {['n', 's', 'e', 'w'].map((direcao) => (
          <div
            key={direcao}
            className={`${styles.pontoCon} ${styles[`pontoCon${direcao.toUpperCase()}`]}`}
            style={{ background: '#666' }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              const rect = e.currentTarget.getBoundingClientRect()
              onIniciarConexao(item.id, rect.left + rect.width / 2, rect.top + rect.height / 2)
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ))}
      </div>

      {menu.visivel && (
        <ContextMenu
          itens={itensMenu}
          x={menu.x}
          y={menu.y}
          onFechar={fecharMenu}
          onSelecionar={handleMenuSelecionar}
        />
      )}

      {showColorPicker && (
        <ColorPicker
          coresSugeridas={CORES_NOTA}
          corAtual={item.color}
          onChange={(cor) => atualizarItemQuadro(quadroId, item.id, { color: cor })}
          onFechar={() => setShowColorPicker(false)}
          x={corPickerPos.x}
          y={corPickerPos.y}
        />
      )}
    </>
  )
}

function obterCorTexto(corFundo: string): string {
  // Calcular luminância relativa para determinar cor do texto
  const hex = corFundo.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  const luminancia = 0.299 * r + 0.587 * g + 0.114 * b
  return luminancia > 0.5 ? '#212121' : '#FFFFFF'
}
