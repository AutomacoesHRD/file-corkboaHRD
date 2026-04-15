import React, { useEffect, useState } from 'react'
import { ItemImagemQuadro } from '../../types'
import { ContextMenu, ItemMenuContexto, useContextMenu } from '../Shared/ContextMenu'
import { useAppStore } from '../../stores/appStore'
import { STRINGS } from '../../constants/strings'
import styles from './BoardNode.module.css'

interface PropsImageNode {
  item: ItemImagemQuadro
  quadroId: string
  selecionado: boolean
  escala: number
  onIniciarConexao: (itemId: string, x: number, y: number) => void
  onSelecionar: (id: string) => void
}

/**
 * Representação de uma imagem externa no canvas do quadro.
 */
export const ImageNode: React.FC<PropsImageNode> = ({
  item,
  quadroId,
  selecionado,
  escala,
  onIniciarConexao,
  onSelecionar,
}) => {
  const { atualizarItemQuadro, removerItemDoQuadro } = useAppStore()
  const { menu, abrirMenu, fecharMenu } = useContextMenu()
  const [dataUrl, setDataUrl] = useState<string>(item.imageDataUrl ?? '')
  const [carregando, setCarregando] = useState(!item.imageDataUrl)
  const [redimensionando, setRedimensionando] = useState(false)

  // Carregar imagem como Base64 se ainda não tiver
  useEffect(() => {
    if (item.imageDataUrl) {
      setDataUrl(item.imageDataUrl)
      return
    }
    setCarregando(true)
    window.electronAPI.fs.readImageAsBase64(item.imagePath).then((resultado) => {
      if (resultado.sucesso && resultado.dataUrl) {
        setDataUrl(resultado.dataUrl)
        // Cachear no store para não recarregar
        atualizarItemQuadro(quadroId, item.id, { imageDataUrl: resultado.dataUrl })
      }
      setCarregando(false)
    })
  }, [item.imagePath, item.imageDataUrl, item.id, quadroId, atualizarItemQuadro])

  const largura = item.width ?? 200
  const altura = item.height ?? 150

  const itensMenu: ItemMenuContexto[] = [
    {
      id: 'abrir',
      label: 'Abrir Imagem',
      icone: <svg viewBox="0 0 14 14" fill="currentColor"><path d="M3 3h3v2H5v4h4V7h2v4H3V3zm4 0h4v4h-2V5.4L5.4 9 4 7.6 7.6 4H7V3z"/></svg>,
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
      case 'abrir':
        window.electronAPI.shell.openPath(item.imagePath)
        break
      case 'remover':
        removerItemDoQuadro(quadroId, item.id)
        break
    }
  }

  // Redimensionamento pelo canto inferior direito
  const handleRedimensionar = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startW = largura
    const startH = altura

    const onMove = (ev: MouseEvent) => {
      const deltaX = (ev.clientX - startX) / escala
      const deltaY = (ev.clientY - startY) / escala
      atualizarItemQuadro(quadroId, item.id, {
        width: Math.max(80, startW + deltaX),
        height: Math.max(60, startH + deltaY),
      })
    }

    const onUp = () => {
      setRedimensionando(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    setRedimensionando(true)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <>
      <div
        className={`${styles.imageNode} ${selecionado ? styles.selecionado : ''}`}
        style={{ width: largura, height: altura }}
        onDoubleClick={() => window.electronAPI.shell.openPath(item.imagePath)}
        onContextMenu={(e) => {
          e.stopPropagation()
          abrirMenu(e)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelecionar(item.id)
        }}
      >
        {carregando ? (
          <div className={styles.carregandoImagem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.iconCarregar}>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
              <path d="M12 3a9 9 0 019 9" strokeLinecap="round"/>
            </svg>
          </div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt={item.imagePath}
            className={styles.imagem}
            draggable={false}
          />
        ) : (
          <div className={styles.erroImagem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l16 16M4 20L20 4"/>
            </svg>
            <span>Imagem não disponível</span>
          </div>
        )}

        {/* Alça de redimensionamento */}
        {selecionado && (
          <div
            className={styles.alcaRedimensionar}
            onMouseDown={handleRedimensionar}
            title="Redimensionar"
          />
        )}

        {/* Pontos de conexão */}
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
