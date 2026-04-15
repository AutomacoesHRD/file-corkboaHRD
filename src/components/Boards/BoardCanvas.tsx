import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { ItemQuadro, ItemArquivoQuadro, ItemNotaQuadro, ItemImagemQuadro } from '../../types'
import { FileNode } from './FileNode'
import { NoteNode } from './NoteNode'
import { ImageNode } from './ImageNode'
import { Connection } from './Connection'
import { FileSidebar } from './FileSidebar'
import { ColorPicker } from '../Shared/ColorPicker'
import { CORES_CONEXAO, COR_CONEXAO_PADRAO } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import styles from './BoardCanvas.module.css'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 4.0
const ZOOM_STEP = 0.1

interface Props { quadroId: string }

export const BoardCanvas: React.FC<Props> = ({ quadroId }) => {
  const store = useAppStore()
  const quadro = store.indexacao?.boards.find(b => b.id === quadroId)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Viewport
  const [zoom, setZoom] = useState(quadro?.viewport.zoom ?? 1)
  const [panX, setPanX] = useState(quadro?.viewport.panX ?? 0)
  const [panY, setPanY] = useState(quadro?.viewport.panY ?? 0)

  // Interaction
  const draggingRef = useRef<{ itemId: string; ox: number; oy: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const panningRef = useRef(false)
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  // Connection — modo "dois cliques nos pontos de conexão"
  // Clique no ponto do item A → fica "pendente", clique no ponto do item B → cria cordinha
  const [connPendingFrom, setConnPendingFrom] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [pendingConn, setPendingConn] = useState<{ from: string; to: string } | null>(null)
  const cpPos = useRef({ x: 0, y: 0 })

  // UI
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fabOpen, setFabOpen] = useState(false)
  const [mostrarNomeOriginal, setMostrarNomeOriginal] = useState(false)

  if (!quadro) return null

  // Save viewport debounced
  useEffect(() => {
    const t = setTimeout(() => store.atualizarViewport(quadroId, { zoom, panX, panY }), 500)
    return () => clearTimeout(t)
  }, [zoom, panX, panY, quadroId])

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setConnPendingFrom(null); setSelectedItem(null); setFabOpen(false) }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  // ==================== MOUSE CONTROLS ====================

  // Scroll = zoom centrado no cursor
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    setZoom(z => {
      const newZ = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z + delta))
      if (canvasRef.current) {
        const r = canvasRef.current.getBoundingClientRect()
        const mx = e.clientX - r.left
        const my = e.clientY - r.top
        setPanX(px => px - mx * (newZ / z - 1))
        setPanY(py => py - my * (newZ / z - 1))
      }
      return newZ
    })
  }, [])

  // Botão direito = pan, Botão do meio = centralizar
  const onCanvasDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault()
      panningRef.current = true
      setIsPanning(true)
      panStartRef.current = { mx: e.clientX, my: e.clientY, px: panX, py: panY }
    } else if (e.button === 0) {
      setSelectedItem(null)
      // Clique no fundo cancela conexão pendente
      setConnPendingFrom(null)
    }
  }

  const onCanvasMove = (e: React.MouseEvent) => {
    if (panningRef.current) {
      setPanX(panStartRef.current.px + e.clientX - panStartRef.current.mx)
      setPanY(panStartRef.current.py + e.clientY - panStartRef.current.my)
    }
    if (draggingRef.current && canvasRef.current) {
      const r = canvasRef.current.getBoundingClientRect()
      store.moverItemQuadro(quadroId, draggingRef.current.itemId,
        (e.clientX - r.left - panX) / zoom - draggingRef.current.ox,
        (e.clientY - r.top - panY) / zoom - draggingRef.current.oy)
    }
  }

  const onCanvasUp = (e: React.MouseEvent) => {
    if (e.button === 1) { fitView(); return }
    panningRef.current = false
    setIsPanning(false)
    draggingRef.current = null
    setIsDragging(false)
  }

  const onContextMenu = (e: React.MouseEvent) => { e.preventDefault() }

  // Item drag (botão esquerdo)
  const onItemDown = (e: React.MouseEvent, item: ItemQuadro) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (!canvasRef.current) return
    const r = canvasRef.current.getBoundingClientRect()
    draggingRef.current = {
      itemId: item.id,
      ox: (e.clientX - r.left - panX) / zoom - item.x,
      oy: (e.clientY - r.top - panY) / zoom - item.y,
    }
    setIsDragging(true)
    setSelectedItem(item.id)
  }

  // ==================== CONNECTIONS (dois cliques) ====================

  // Chamado pelo ponto de conexão de um node
  const onConnPointClick = (itemId: string, screenX: number, screenY: number) => {
    if (!connPendingFrom) {
      // Primeiro clique — marcar item de origem
      setConnPendingFrom(itemId)
    } else if (connPendingFrom === itemId) {
      // Clicou no mesmo item — cancelar
      setConnPendingFrom(null)
    } else {
      // Segundo clique — criar conexão
      const exists = quadro.connections.some(c =>
        (c.fromItemId === connPendingFrom && c.toItemId === itemId) ||
        (c.fromItemId === itemId && c.toItemId === connPendingFrom))
      if (!exists) {
        cpPos.current = { x: screenX, y: screenY }
        setPendingConn({ from: connPendingFrom, to: itemId })
        setShowColorPicker(true)
      }
      setConnPendingFrom(null)
    }
  }

  const confirmConn = (color: string) => {
    if (!pendingConn) return
    store.adicionarConexao(quadroId, { fromItemId: pendingConn.from, toItemId: pendingConn.to, color })
    setPendingConn(null)
    setShowColorPicker(false)
  }

  // ==================== DROP FROM SIDEBAR ====================
  const stateRef = useRef({ quadroId, panX, panY, zoom })
  stateRef.current = { quadroId, panX, panY, zoom }

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const over = (e: DragEvent) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy' }
    const drop = (e: DragEvent) => {
      e.preventDefault()
      const fid = e.dataTransfer?.getData('application/corkboard-file-id')
      if (!fid) return
      const s = stateRef.current
      const r = el.getBoundingClientRect()
      store.adicionarItemArquivoAoQuadro(s.quadroId, fid, (e.clientX - r.left - s.panX) / s.zoom, (e.clientY - r.top - s.panY) / s.zoom)
    }
    el.addEventListener('dragover', over)
    el.addEventListener('drop', drop)
    return () => { el.removeEventListener('dragover', over); el.removeEventListener('drop', drop) }
  }, [])

  // Click from sidebar
  const onSidebarClick = useCallback((fileId: string) => {
    const r = canvasRef.current?.getBoundingClientRect()
    const cx = r ? r.width / 2 : 400, cy = r ? r.height / 2 : 300
    store.adicionarItemArquivoAoQuadro(quadroId, fileId, (cx - panX) / zoom, (cy - panY) / zoom)
  }, [quadroId, panX, panY, zoom])

  // ==================== FAB ====================
  const addNote = () => {
    const r = canvasRef.current?.getBoundingClientRect()
    const cx = r ? r.width / 2 : 400, cy = r ? r.height / 2 : 300
    store.adicionarItemNotaAoQuadro(quadroId, (cx - panX) / zoom, (cy - panY) / zoom)
    setFabOpen(false)
  }
  const addImage = async () => {
    const p = await window.electronAPI.dialog.selectFile([{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'] }])
    if (!p) return
    const r = canvasRef.current?.getBoundingClientRect()
    const cx = r ? r.width / 2 : 400, cy = r ? r.height / 2 : 300
    store.adicionarItemImagemAoQuadro(quadroId, p, (cx - panX) / zoom, (cy - panY) / zoom)
    setFabOpen(false)
  }
  const fitView = () => {
    if (quadro.items.length === 0) { setZoom(1); setPanX(0); setPanY(0); return }
    const r = canvasRef.current?.getBoundingClientRect()
    if (!r) return
    const xs = quadro.items.map(i => i.x), ys = quadro.items.map(i => i.y)
    const x0 = Math.min(...xs) - 100, x1 = Math.max(...xs) + 250
    const y0 = Math.min(...ys) - 100, y1 = Math.max(...ys) + 150
    const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.min(r.width / (x1 - x0), r.height / (y1 - y0)) * 0.85))
    setZoom(z)
    setPanX(-x0 * z + (r.width - (x1 - x0) * z) / 2)
    setPanY(-y0 * z + (r.height - (y1 - y0) * z) / 2)
  }

  const cursor = isPanning ? 'grabbing' : connPendingFrom ? 'crosshair' : isDragging ? 'grabbing' : 'default'

  return (
    <div className={styles.container}>
      <FileSidebar visivel={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onAdicionarArquivo={onSidebarClick} mostrarNomeOriginal={mostrarNomeOriginal} />

      <div
        ref={canvasRef}
        className={styles.canvas}
        style={{ cursor }}
        onMouseDown={onCanvasDown}
        onMouseMove={onCanvasMove}
        onMouseUp={onCanvasUp}
        onMouseLeave={() => { panningRef.current = false; setIsPanning(false); draggingRef.current = null; setIsDragging(false) }}
        onWheel={onWheel}
        onContextMenu={onContextMenu}
      >
        {/* SVG conexões */}
        <svg className={styles.svgConexoes}>
          {quadro.connections.map(c => (
            <Connection key={c.id} conexao={c} quadroId={quadroId} itens={quadro.items} escala={zoom} panX={panX} panY={panY} isPanning={isPanning} />
          ))}
        </svg>

        {/* Camada de itens */}
        <div className={styles.camadaItens} style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }}>
          {quadro.items.map(item => {
            const sel = selectedItem === item.id
            const isConnSource = connPendingFrom === item.id
            const np = {
              quadroId, selecionado: sel || isConnSource, escala: zoom,
              onIniciarConexao: onConnPointClick,
              onSelecionar: (id: string) => setSelectedItem(id),
            }
            return (
              <div key={item.id} style={{ position: 'absolute', left: item.x, top: item.y, zIndex: sel ? 100 : 1 }}
                onMouseDown={e => onItemDown(e, item)}>
                {item.type === 'file' && <FileNode item={item as ItemArquivoQuadro} {...np} mostrarNomeOriginal={mostrarNomeOriginal} />}
                {item.type === 'note' && <NoteNode item={item as ItemNotaQuadro} {...np} />}
                {item.type === 'image' && <ImageNode item={item as ItemImagemQuadro} {...np} />}
              </div>
            )
          })}
        </div>

        {/* Indicador visual de conexão pendente */}
        {connPendingFrom && (
          <div className={styles.connHint}>
            Clique no ponto de outro item para conectar (Esc para cancelar)
          </div>
        )}

        {quadro.items.length === 0 && (
          <div className={styles.instrucaoVazio}>
            <p>Clique num arquivo na sidebar para adicionar,<br/>ou use o botão + abaixo</p>
          </div>
        )}
      </div>

      {/* OVERLAY UI */}
      <button className={styles.botaoVoltar} onClick={() => store.definirQuadroAtivo(null)}>
        <svg viewBox="0 0 14 14"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        {STRINGS.QUADROS_VOLTAR}
      </button>

      {/* Toolbar: abrir todos + toggle nomes */}
      <div className={styles.toolbar}>
        <button className={styles.toolbarBtn} onClick={() => {
          const fileItems = quadro.items.filter(i => i.type === 'file')
          for (const fi of fileItems) {
            const f = store.indexacao?.files.find(a => a.id === (fi as ItemArquivoQuadro).fileId)
            if (f && !f.isDeleted) window.electronAPI.shell.openPath(f.absolutePath)
          }
        }} title="Abrir todos os arquivos do quadro">
          <svg viewBox="0 0 16 16" fill="currentColor" style={{width:13,height:13}}><path d="M2 4a2 2 0 012-2h5l2 2h3a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V4z"/></svg>
          Abrir Todos
        </button>
        <button className={`${styles.toolbarBtn} ${mostrarNomeOriginal ? styles.toolbarBtnAtivo : ''}`}
          onClick={() => setMostrarNomeOriginal(!mostrarNomeOriginal)}
          title={mostrarNomeOriginal ? 'Mostrar nomes dados' : 'Mostrar nomes originais'}>
          <svg viewBox="0 0 16 16" fill="currentColor" style={{width:13,height:13}}><path d="M2 3h12v1.5H2V3zm0 4h8v1.5H2V7zm0 4h10v1.5H2V11z"/></svg>
          {mostrarNomeOriginal ? 'Nome Original' : 'Nome Dado'}
        </button>
      </div>

      <div className={styles.controles}>
        <button className={styles.botaoZoom} onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))}>+</button>
        <span className={styles.indicadorZoom}>{Math.round(zoom * 100)}%</span>
        <button className={styles.botaoZoom} onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))}>−</button>
        <button className={styles.botaoZoom} onClick={fitView} title="Centralizar">⊞</button>
      </div>

      <div className={styles.fabContainer}>
        {fabOpen && (
          <div className={styles.fabMenu}>
            <button className={styles.fabOpcao} onClick={() => { setFabOpen(false); setSidebarOpen(true) }}>{STRINGS.CANVAS_ADICIONAR_ARQUIVO}</button>
            <button className={styles.fabOpcao} onClick={addNote}>{STRINGS.CANVAS_ADICIONAR_NOTA}</button>
            <button className={styles.fabOpcao} onClick={addImage}>{STRINGS.CANVAS_ADICIONAR_IMAGEM}</button>
          </div>
        )}
        <button className={`${styles.fab} ${fabOpen ? styles.fabAtivo : ''}`} onClick={() => setFabOpen(!fabOpen)}>
          <svg viewBox="0 0 16 16" style={{ transform: fabOpen ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }}>
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {showColorPicker && (
        <ColorPicker coresSugeridas={CORES_CONEXAO} corAtual={COR_CONEXAO_PADRAO}
          onChange={cor => confirmConn(cor)} onFechar={() => confirmConn(COR_CONEXAO_PADRAO)}
          x={cpPos.current.x} y={cpPos.current.y} />
      )}
    </div>
  )
}
