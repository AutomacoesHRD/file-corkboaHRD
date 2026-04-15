import React from 'react'
import { ItemArquivoQuadro, ArquivoIndexado } from '../../types'
import { FileIcon } from '../Shared/FileIcon'
import { ContextMenu, ItemMenuContexto, useContextMenu } from '../Shared/ContextMenu'
import { useAppStore } from '../../stores/appStore'
import { useFileSystem } from '../../hooks/useFileSystem'
import { STRINGS } from '../../constants/strings'
import styles from './BoardNode.module.css'

interface PropsFileNode {
  item: ItemArquivoQuadro
  quadroId: string
  selecionado: boolean
  escala: number
  onIniciarConexao: (itemId: string, x: number, y: number) => void
  onSelecionar: (id: string) => void
  mostrarNomeOriginal?: boolean
}

/**
 * Representação de um arquivo no canvas do quadro.
 */
export const FileNode: React.FC<PropsFileNode> = ({
  item,
  quadroId,
  selecionado,
  onIniciarConexao,
  onSelecionar,
  mostrarNomeOriginal = false,
}) => {
  const { indexacao, removerItemDoQuadro, definirAbaAtiva } = useAppStore()
  const { abrirArquivo } = useFileSystem()
  const { menu, abrirMenu, fecharMenu } = useContextMenu()

  const arquivo: ArquivoIndexado | undefined = indexacao?.files.find((f) => f.id === item.fileId)

  if (!arquivo) return null

  const nome = mostrarNomeOriginal ? arquivo.originalName : (arquivo.memorableName || arquivo.originalName)

  const handleDuploClique = () => {
    if (!arquivo.isDeleted) {
      abrirArquivo(arquivo.absolutePath)
    }
  }

  const itensMenu: ItemMenuContexto[] = [
    {
      id: 'abrir',
      label: STRINGS.CARD_ABRIR_ARQUIVO,
      desabilitado: arquivo.isDeleted,
      icone: (
        <svg viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 3h3v2H5v4h4V7h2v4H3V3zm4 0h4v4h-2V5.4L5.4 9 4 7.6 7.6 4H7V3z"/>
        </svg>
      ),
    },
    {
      id: 'verNoIndice',
      label: STRINGS.CARD_VER_NO_INDICE,
      icone: (
        <svg viewBox="0 0 14 14" fill="currentColor">
          <path d="M2 3h10v1.5H2V3zm0 3h10v1.5H2V6zm0 3h6v1.5H2V9z"/>
        </svg>
      ),
    },
    { id: 'sep', label: '', separador: true },
    {
      id: 'remover',
      label: STRINGS.CARD_REMOVER_QUADRO,
      perigo: true,
      icone: (
        <svg viewBox="0 0 14 14" fill="currentColor">
          <path d="M4 2L10 8M10 2L4 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  const handleMenuSelecionar = (acao: string) => {
    switch (acao) {
      case 'abrir':
        if (!arquivo.isDeleted) abrirArquivo(arquivo.absolutePath)
        break
      case 'verNoIndice':
        definirAbaAtiva('indice')
        break
      case 'remover':
        removerItemDoQuadro(quadroId, item.id)
        break
    }
  }

  return (
    <>
      <div
        className={`${styles.fileNode} ${selecionado ? styles.selecionado : ''} ${arquivo.isDeleted ? styles.deletado : ''}`}
        onDoubleClick={handleDuploClique}
        onContextMenu={abrirMenu}
        onClick={(e) => {
          e.stopPropagation()
          onSelecionar(item.id)
        }}
      >
        <div className={styles.icone}>
          <FileIcon extensao={arquivo.extension} tamanho={20} />
        </div>
        <div className={styles.nome} title={arquivo.absolutePath}>{nome}</div>
        {arquivo.isDeleted && (
          <div className={styles.alertaDeletado} title={STRINGS.CARD_TOOLTIP_DELETADO}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 2l4.5 8H1.5L6 2zm0 3v2.5m0 1v.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Pontos de conexão — clique para iniciar/finalizar conexão */}
        {['n', 's', 'e', 'w'].map((direcao) => (
          <div
            key={direcao}
            className={`${styles.pontoCon} ${styles[`pontoCon${direcao.toUpperCase()}`]}`}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              const rect = e.currentTarget.getBoundingClientRect()
              onIniciarConexao(item.id, rect.left + rect.width / 2, rect.top + rect.height / 2)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Clique para conectar"
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
    </>
  )
}
