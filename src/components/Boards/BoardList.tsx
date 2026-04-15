import React, { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { ContextMenu, ItemMenuContexto, useContextMenu } from '../Shared/ContextMenu'
import { ConfirmDialog } from '../Shared/ConfirmDialog'
import { STRINGS } from '../../constants/strings'
import { QuadroCortica } from '../../types'
import styles from './BoardList.module.css'

/**
 * Lista/grid de quadros disponíveis na aba "Quadros".
 */
export const BoardList: React.FC = () => {
  const {
    indexacao,
    criarQuadro,
    excluirQuadro,
    duplicarQuadro,
    atualizarQuadro,
    definirQuadroAtivo,
  } = useAppStore()

  const boards = indexacao?.boards ?? []
  const { menu, abrirMenu, fecharMenu } = useContextMenu()

  const [criandoQuadro, setCriandoQuadro] = useState(false)
  const [nomeNovoQuadro, setNomeNovoQuadro] = useState('')
  const [quadroParaExcluir, setQuadroParaExcluir] = useState<string | null>(null)
  const [quadroRenomeando, setQuadroRenomeando] = useState<string | null>(null)
  const [nomeRenomear, setNomeRenomear] = useState('')
  const [quadroMenuAtivo, setQuadroMenuAtivo] = useState<string | null>(null)

  const handleCriarQuadro = () => {
    const nome = nomeNovoQuadro.trim()
    if (!nome) return
    const novoQuadro = criarQuadro(nome)
    setCriandoQuadro(false)
    setNomeNovoQuadro('')
    // Abrir o quadro recém-criado
    definirQuadroAtivo(novoQuadro.id)
  }

  const handleAbrirQuadro = (id: string) => {
    definirQuadroAtivo(id)
  }

  const handleMenuContexto = (e: React.MouseEvent, quadroId: string) => {
    setQuadroMenuAtivo(quadroId)
    abrirMenu(e)
  }

  const contarArquivos = (quadro: QuadroCortica): number => {
    return quadro.items.filter((item) => item.type === 'file').length
  }

  const formatarData = (iso: string): string => {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const itensMenu: ItemMenuContexto[] = [
    {
      id: 'abrir',
      label: 'Abrir Quadro',
      icone: (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 3h4v2H5v6h6V9h2v4H3V3zm6 0h4v4h-2V5.4L7.4 9 6 7.6 9.6 4H8V3z"/>
        </svg>
      ),
    },
    { id: 'sep1', label: '', separador: true },
    {
      id: 'renomear',
      label: STRINGS.RENOMEAR,
      icone: (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10z"/>
        </svg>
      ),
    },
    {
      id: 'duplicar',
      label: STRINGS.DUPLICAR,
      icone: (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm4 4a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H6a1 1 0 110-2h1V7a1 1 0 011-1z"/>
        </svg>
      ),
    },
    { id: 'sep2', label: '', separador: true },
    {
      id: 'excluir',
      label: STRINGS.EXCLUIR,
      perigo: true,
      icone: (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H2.506a.58.58 0 00-.01 0H1.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 004.885 16h6.23a2 2 0 001.994-1.84l.853-10.66h.538a.5.5 0 000-1h-.985a.58.58 0 00-.01 0H11z"/>
        </svg>
      ),
    },
  ]

  const handleMenuSelecionar = async (acao: string) => {
    if (!quadroMenuAtivo) return
    switch (acao) {
      case 'abrir':
        handleAbrirQuadro(quadroMenuAtivo)
        break
      case 'renomear': {
        const quadro = boards.find((b) => b.id === quadroMenuAtivo)
        if (quadro) {
          setNomeRenomear(quadro.name)
          setQuadroRenomeando(quadroMenuAtivo)
        }
        break
      }
      case 'duplicar':
        duplicarQuadro(quadroMenuAtivo)
        break
      case 'excluir':
        setQuadroParaExcluir(quadroMenuAtivo)
        break
    }
  }

  if (boards.length === 0 && !criandoQuadro) {
    return (
      <div className={styles.vazio}>
        <div className={styles.vazioConteudo}>
          <div className={styles.vazioIcone}>
            <svg viewBox="0 0 64 64" fill="none">
              <rect x="6" y="6" width="52" height="52" rx="8" fill="currentColor" opacity="0.08"/>
              <rect x="6" y="6" width="52" height="52" rx="8" stroke="currentColor" strokeWidth="2"/>
              <circle cx="20" cy="22" r="4" fill="currentColor" opacity="0.3"/>
              <circle cx="44" cy="30" r="4" fill="currentColor" opacity="0.3"/>
              <circle cx="30" cy="44" r="4" fill="currentColor" opacity="0.3"/>
              <path d="M20 22L44 30M44 30L30 44" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 2"/>
              <circle cx="48" cy="48" r="12" fill="var(--accent-primary)"/>
              <path d="M44 48h8M48 44v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className={styles.vazioTitulo}>{STRINGS.QUADROS_VAZIO_TITULO}</h2>
          <p className={styles.vazioSubtitulo}>{STRINGS.QUADROS_VAZIO_SUBTITULO}</p>
          <button
            className={styles.botaoCriar}
            onClick={() => setCriandoQuadro(true)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
            </svg>
            {STRINGS.QUADROS_NOVO}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.cabecalho}>
        <h2 className={styles.titulo}>{STRINGS.QUADROS_TITULO}</h2>
        <button
          className={styles.botaoCriar}
          onClick={() => setCriandoQuadro(true)}
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4a1 1 0 011 1v2h2a1 1 0 110 2H9v2a1 1 0 11-2 0V9H5a1 1 0 110-2h2V5a1 1 0 011-1z"/>
          </svg>
          {STRINGS.QUADROS_NOVO}
        </button>
      </div>

      {/* Input para novo quadro */}
      {criandoQuadro && (
        <div className={styles.inputNovo}>
          <input
            type="text"
            placeholder={STRINGS.QUADROS_NOVO_PLACEHOLDER}
            value={nomeNovoQuadro}
            onChange={(e) => setNomeNovoQuadro(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCriarQuadro()
              if (e.key === 'Escape') {
                setCriandoQuadro(false)
                setNomeNovoQuadro('')
              }
            }}
            autoFocus
            maxLength={60}
          />
          <button className={styles.botaoConfirmarNovo} onClick={handleCriarQuadro}>Criar</button>
          <button
            className={styles.botaoCancelarNovo}
            onClick={() => {
              setCriandoQuadro(false)
              setNomeNovoQuadro('')
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Grid de quadros */}
      <div className={styles.grid}>
        {boards.map((quadro) => (
          <div
            key={quadro.id}
            className={styles.card}
            onDoubleClick={() => handleAbrirQuadro(quadro.id)}
            onContextMenu={(e) => handleMenuContexto(e, quadro.id)}
          >
            {/* Miniatura de cortiça */}
            <div className={styles.miniatura}>
              <div className={styles.miniaturaPontilhado}>
                {quadro.items.slice(0, 6).map((item, i) => (
                  <div
                    key={item.id}
                    className={styles.miniaturaItem}
                    style={{
                      left: `${10 + (i % 3) * 28}%`,
                      top: `${15 + Math.floor(i / 3) * 40}%`,
                      background: item.type === 'note'
                        ? (item as { color?: string }).color ?? '#FFF176'
                        : 'var(--bg-secondary)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Informações */}
            <div className={styles.info}>
              {quadroRenomeando === quadro.id ? (
                <input
                  className={styles.inputRenomear}
                  value={nomeRenomear}
                  onChange={(e) => setNomeRenomear(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      atualizarQuadro(quadro.id, { name: nomeRenomear.trim() || quadro.name })
                      setQuadroRenomeando(null)
                    }
                    if (e.key === 'Escape') setQuadroRenomeando(null)
                  }}
                  onBlur={() => {
                    atualizarQuadro(quadro.id, { name: nomeRenomear.trim() || quadro.name })
                    setQuadroRenomeando(null)
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  maxLength={60}
                />
              ) : (
                <span className={styles.nome}>{quadro.name}</span>
              )}
              <span className={styles.metadados}>
                {STRINGS.QUADROS_ITENS(quadro.items.length)} · {formatarData(quadro.createdAt)}
              </span>
            </div>

            {/* Botão de menu */}
            <button
              className={styles.botaoMenu}
              onClick={(e) => handleMenuContexto(e, quadro.id)}
              title="Opções"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5"/>
                <circle cx="8" cy="8" r="1.5"/>
                <circle cx="8" cy="13" r="1.5"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Menu de contexto */}
      {menu.visivel && (
        <ContextMenu
          itens={itensMenu}
          x={menu.x}
          y={menu.y}
          onFechar={fecharMenu}
          onSelecionar={handleMenuSelecionar}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      {quadroParaExcluir && (
        <ConfirmDialog
          titulo="Excluir Quadro"
          mensagem={`Tem certeza que deseja excluir o quadro "${boards.find((b) => b.id === quadroParaExcluir)?.name}"? ${STRINGS.ACAO_IRREVERSIVEL}`}
          textoBotaoConfirmar="Excluir"
          perigo
          onConfirmar={() => {
            excluirQuadro(quadroParaExcluir)
            setQuadroParaExcluir(null)
          }}
          onCancelar={() => setQuadroParaExcluir(null)}
        />
      )}
    </div>
  )
}
