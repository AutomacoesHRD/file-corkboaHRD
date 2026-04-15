import React, { useState, useId } from 'react'
import { ConexaoQuadro, ItemQuadro } from '../../types'
import { useAppStore } from '../../stores/appStore'

interface PropsConnection {
  conexao: ConexaoQuadro
  quadroId: string
  itens: ItemQuadro[]
  escala: number
  panX: number
  panY: number
  isPanning?: boolean
}

const NODE_SIZE = { w: 140, h: 70 }

function getCenter(item: ItemQuadro): { x: number; y: number } {
  if (item.type === 'image') {
    return { x: item.x + (item.width ?? 200) / 2, y: item.y + (item.height ?? 150) / 2 }
  }
  if (item.type === 'note') {
    return { x: item.x + 80, y: item.y + 50 }
  }
  return { x: item.x + NODE_SIZE.w / 2, y: item.y + NODE_SIZE.h / 2 }
}

/**
 * "Fio de lã" frouxo entre dois itens.
 * Usa curva cúbica com controle-points caídos (simulando gravidade/frouxidão).
 * Animação de balanço via CSS quando isPanning=true.
 */
export const Connection: React.FC<PropsConnection> = ({
  conexao, quadroId, itens, escala, panX, panY, isPanning,
}) => {
  const { removerConexao } = useAppStore()
  const [hover, setHover] = useState(false)
  const filterId = useId()

  const from = itens.find(i => i.id === conexao.fromItemId)
  const to = itens.find(i => i.id === conexao.toItemId)
  if (!from || !to) return null

  const fc = getCenter(from)
  const tc = getCenter(to)

  // Converter para coordenadas de tela
  const x1 = fc.x * escala + panX
  const y1 = fc.y * escala + panY
  const x2 = tc.x * escala + panX
  const y2 = tc.y * escala + panY

  // Distância horizontal e vertical
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Frouxidão: quanto maior a distância, mais a corda cai
  // O sag (queda) é proporcional à distância, simulando gravidade
  const sag = Math.max(40, dist * 0.35)

  // Ponto médio
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2

  // Controle-points: caem para baixo (gravidade no eixo Y)
  // Adicionar leve assimetria para parecer mais natural
  const cx1 = x1 + dx * 0.25
  const cy1 = y1 + sag * 0.7
  const cx2 = x2 - dx * 0.25
  const cy2 = y2 + sag * 0.7

  const d = `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`

  // Posição do rótulo
  const labelX = mx
  const labelY = my + sag * 0.3

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    removerConexao(quadroId, conexao.id)
  }

  return (
    <g style={{ pointerEvents: 'auto' }}>
      {/* Filtro de sombra suave */}
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dy="2" />
          <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hitbox invisível mais larga para facilitar clique */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />

      {/* Cordinha visual */}
      <path
        d={d}
        stroke={conexao.color}
        strokeWidth={hover ? 4 : 2.5}
        fill="none"
        strokeLinecap="round"
        filter={`url(#${filterId})`}
        style={{
          pointerEvents: 'none',
          transition: 'stroke-width 0.15s',
          // Animação de balanço quando panando
          ...(isPanning ? {
            animation: 'ropeSwing 0.6s ease-in-out',
          } : {}),
        }}
      />

      {/* X para deletar ao hover */}
      {hover && (
        <g transform={`translate(${labelX}, ${labelY})`} style={{ cursor: 'pointer', pointerEvents: 'auto' }} onClick={handleClick}>
          <circle r="10" fill="rgba(220,40,40,0.9)" />
          <path d="M-4,-4 L4,4 M4,-4 L-4,4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Rótulo se existir */}
      {conexao.label && !hover && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-conexao.label.length * 3.5 - 6} y={-9}
            width={conexao.label.length * 7 + 12} height={18}
            rx={4} fill="rgba(0,0,0,0.6)"
          />
          <text textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontFamily="Segoe UI Variable, sans-serif">
            {conexao.label}
          </text>
        </g>
      )}
    </g>
  )
}
