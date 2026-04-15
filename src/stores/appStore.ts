import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import {
  ArquivoIndexado,
  CategoriaArquivo,
  ConexaoQuadro,
  DadosIndexacao,
  DadosMestre,
  Indexacao,
  ItemArquivoQuadro,
  ItemImagemQuadro,
  ItemNotaQuadro,
  ItemQuadro,
  ModoOrdenacao,
  PastaIndexada,
  QuadroCortica,
  TemaApp,
  ViewportQuadro,
} from '../types'
import { aplicarTema } from '../styles/themes'
import { COR_NOTA_PADRAO } from '../constants/colors'

// ============================================================
// Estado da aplicação — suporta múltiplas indexações
// ============================================================

interface EstadoApp {
  // === Dados Mestre ===
  master: DadosMestre
  masterCarregado: boolean

  // === Indexação Ativa ===
  indexacao: DadosIndexacao | null
  indexacaoCarregada: boolean

  // === UI State ===
  abaAtiva: 'indice' | 'quadros'
  quadroAtivoId: string | null
  termoBusca: string
  filtroCategoria: CategoriaArquivo | 'all'
  modoOrdenacao: ModoOrdenacao
  salvarPendente: boolean
  salvarMasterPendente: boolean

  // === Ações Master ===
  carregarMaster: (master: DadosMestre) => void
  salvarMasterFlag: () => void
  criarIndexacao: (nome: string, rootPath: string) => Indexacao
  renomearIndexacao: (id: string, nome: string) => void
  excluirIndexacao: (id: string) => void
  trocarIndexacao: (id: string | null) => void
  importarIndexacaoMeta: (indexacao: Indexacao) => void

  // === Ações Indexação Ativa ===
  carregarIndexacao: (dados: DadosIndexacao) => void

  // === Ações de Configurações ===
  alternarTema: () => void
  definirModoOrdenacao: (modo: ModoOrdenacao) => void

  // === Ações de Pastas ===
  adicionarPasta: (pasta: PastaIndexada) => void
  removerPasta: (id: string) => void

  // === Ações de Arquivos ===
  adicionarArquivos: (arquivos: ArquivoIndexado[]) => void
  atualizarArquivo: (id: string, atualizacoes: Partial<ArquivoIndexado>) => void
  removerArquivo: (id: string) => void
  reordenarArquivos: (ids: string[], categoria: CategoriaArquivo) => void

  // === Ações de Quadros ===
  criarQuadro: (nome: string) => QuadroCortica
  atualizarQuadro: (id: string, atualizacoes: Partial<QuadroCortica>) => void
  excluirQuadro: (id: string) => void
  duplicarQuadro: (id: string) => QuadroCortica | null
  importarQuadro: (quadro: QuadroCortica) => void
  definirQuadroAtivo: (id: string | null) => void

  // === Ações de Itens no Canvas ===
  adicionarItemArquivoAoQuadro: (quadroId: string, fileId: string, x: number, y: number) => void
  adicionarItemNotaAoQuadro: (quadroId: string, x: number, y: number) => void
  adicionarItemImagemAoQuadro: (quadroId: string, imagePath: string, x: number, y: number) => void
  atualizarItemQuadro: (quadroId: string, itemId: string, atualizacoes: Partial<ItemQuadro>) => void
  removerItemDoQuadro: (quadroId: string, itemId: string) => void
  moverItemQuadro: (quadroId: string, itemId: string, x: number, y: number) => void

  // === Ações de Conexões ===
  adicionarConexao: (quadroId: string, conexao: Omit<ConexaoQuadro, 'id'>) => void
  atualizarConexao: (quadroId: string, conexaoId: string, atualizacoes: Partial<ConexaoQuadro>) => void
  removerConexao: (quadroId: string, conexaoId: string) => void

  // === Ações de Viewport ===
  atualizarViewport: (quadroId: string, viewport: Partial<ViewportQuadro>) => void

  // === UI Actions ===
  definirAbaAtiva: (aba: 'indice' | 'quadros') => void
  definirTermoBusca: (termo: string) => void
  definirFiltroCategoria: (filtro: CategoriaArquivo | 'all') => void
}

const MASTER_INICIAL: DadosMestre = {
  version: '2.0.0',
  activeIndexationId: null,
  indexations: [],
  settings: { theme: 'dark', sortMode: 'manual', language: 'pt-BR' },
}

const INDEXACAO_VAZIA: DadosIndexacao = {
  version: '1.0.0',
  indexedFolders: [],
  files: [],
  boards: [],
}

// Helper: atualizar indexação ativa de forma segura
function updateIdx(state: EstadoApp, fn: (idx: DadosIndexacao) => DadosIndexacao): Partial<EstadoApp> {
  if (!state.indexacao) return {}
  return { indexacao: fn(state.indexacao), salvarPendente: true }
}

export const useAppStore = create<EstadoApp>((set, get) => ({
  master: MASTER_INICIAL,
  masterCarregado: false,
  indexacao: null,
  indexacaoCarregada: false,
  abaAtiva: 'indice',
  quadroAtivoId: null,
  termoBusca: '',
  filtroCategoria: 'all',
  modoOrdenacao: 'manual',
  salvarPendente: false,
  salvarMasterPendente: false,

  // === Master ===
  carregarMaster: (master) => {
    aplicarTema(master.settings.theme)
    set({ master, masterCarregado: true, modoOrdenacao: master.settings.sortMode })
  },

  salvarMasterFlag: () => set({ salvarMasterPendente: true }),

  criarIndexacao: (nome, rootPath) => {
    const nova: Indexacao = {
      id: uuidv4(),
      name: nome,
      rootPath,
      originalRootPath: rootPath,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({
      master: {
        ...s.master,
        indexations: [...s.master.indexations, nova],
        activeIndexationId: nova.id,
      },
      salvarMasterPendente: true,
    }))
    return nova
  },

  renomearIndexacao: (id, nome) => {
    set((s) => ({
      master: {
        ...s.master,
        indexations: s.master.indexations.map(i => i.id === id ? { ...i, name: nome } : i),
      },
      salvarMasterPendente: true,
    }))
  },

  excluirIndexacao: (id) => {
    set((s) => ({
      master: {
        ...s.master,
        indexations: s.master.indexations.filter(i => i.id !== id),
        activeIndexationId: s.master.activeIndexationId === id ? null : s.master.activeIndexationId,
      },
      indexacao: s.master.activeIndexationId === id ? null : s.indexacao,
      indexacaoCarregada: s.master.activeIndexationId === id ? false : s.indexacaoCarregada,
      salvarMasterPendente: true,
    }))
  },

  trocarIndexacao: (id) => {
    set((s) => ({
      master: { ...s.master, activeIndexationId: id },
      indexacao: null,
      indexacaoCarregada: false,
      quadroAtivoId: null,
      salvarMasterPendente: true,
    }))
  },

  importarIndexacaoMeta: (indexacao) => {
    set((s) => ({
      master: {
        ...s.master,
        indexations: [...s.master.indexations, indexacao],
      },
      salvarMasterPendente: true,
    }))
  },

  // === Indexação Ativa ===
  carregarIndexacao: (dados) => {
    set({ indexacao: dados, indexacaoCarregada: true })
  },

  // === Configurações ===
  alternarTema: () => {
    const { master } = get()
    const novoTema: TemaApp = master.settings.theme === 'dark' ? 'light' : 'dark'
    aplicarTema(novoTema)
    set((s) => ({
      master: { ...s.master, settings: { ...s.master.settings, theme: novoTema } },
      salvarMasterPendente: true,
    }))
  },

  definirModoOrdenacao: (modo) => {
    set((s) => ({
      modoOrdenacao: modo,
      master: { ...s.master, settings: { ...s.master.settings, sortMode: modo } },
      salvarMasterPendente: true,
    }))
  },

  // === Pastas ===
  adicionarPasta: (pasta) => set((s) => updateIdx(s, idx => ({
    ...idx, indexedFolders: [...idx.indexedFolders, pasta],
  }))),

  removerPasta: (id) => set((s) => updateIdx(s, idx => ({
    ...idx,
    indexedFolders: idx.indexedFolders.filter(p => p.id !== id),
    files: idx.files.filter(f => f.folderId !== id),
  }))),

  // === Arquivos ===
  adicionarArquivos: (arquivos) => set((s) => updateIdx(s, idx => {
    const existentes = new Set(idx.files.map(f => f.absolutePath))
    const novos = arquivos.filter(a => !existentes.has(a.absolutePath))
    return { ...idx, files: [...idx.files, ...novos] }
  })),

  atualizarArquivo: (id, atualizacoes) => set((s) => updateIdx(s, idx => ({
    ...idx,
    files: idx.files.map(f => f.id === id ? { ...f, ...atualizacoes, updatedAt: new Date().toISOString() } : f),
  }))),

  removerArquivo: (id) => set((s) => updateIdx(s, idx => ({
    ...idx, files: idx.files.filter(f => f.id !== id),
  }))),

  reordenarArquivos: (ids, categoria) => set((s) => updateIdx(s, idx => {
    const files = [...idx.files]
    ids.forEach((id, index) => {
      const i = files.findIndex(f => f.id === id && f.category === categoria)
      if (i !== -1) files[i] = { ...files[i], sortOrder: index }
    })
    return { ...idx, files }
  })),

  // === Quadros ===
  criarQuadro: (nome) => {
    const novo: QuadroCortica = {
      id: uuidv4(), name: nome, items: [], connections: [],
      viewport: { zoom: 1, panX: 0, panY: 0 }, createdAt: new Date().toISOString(),
    }
    set((s) => updateIdx(s, idx => ({ ...idx, boards: [...idx.boards, novo] })))
    return novo
  },

  atualizarQuadro: (id, atualizacoes) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: idx.boards.map(b => b.id === id ? { ...b, ...atualizacoes } : b),
  }))),

  excluirQuadro: (id) => set((s) => ({
    ...updateIdx(s, idx => ({ ...idx, boards: idx.boards.filter(b => b.id !== id) })),
    quadroAtivoId: s.quadroAtivoId === id ? null : s.quadroAtivoId,
  })),

  duplicarQuadro: (id) => {
    const { indexacao } = get()
    if (!indexacao) return null
    const original = indexacao.boards.find(b => b.id === id)
    if (!original) return null
    const dup: QuadroCortica = {
      ...original, id: uuidv4(), name: `${original.name} (Cópia)`,
      items: original.items.map(i => ({ ...i, id: uuidv4() })),
      connections: original.connections.map(c => ({ ...c, id: uuidv4() })),
      createdAt: new Date().toISOString(),
    }
    set((s) => updateIdx(s, idx => ({ ...idx, boards: [...idx.boards, dup] })))
    return dup
  },

  importarQuadro: (quadro) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: [...idx.boards, quadro],
  }))),

  definirQuadroAtivo: (id) => set({ quadroAtivoId: id }),

  // === Itens no Canvas ===
  adicionarItemArquivoAoQuadro: (quadroId, fileId, x, y) => {
    const item: ItemArquivoQuadro = { id: uuidv4(), type: 'file', fileId, x, y }
    set((s) => updateIdx(s, idx => ({
      ...idx, boards: idx.boards.map(b => b.id === quadroId ? { ...b, items: [...b.items, item] } : b),
    })))
  },

  adicionarItemNotaAoQuadro: (quadroId, x, y) => {
    const item: ItemNotaQuadro = { id: uuidv4(), type: 'note', content: '', color: COR_NOTA_PADRAO, x, y }
    set((s) => updateIdx(s, idx => ({
      ...idx, boards: idx.boards.map(b => b.id === quadroId ? { ...b, items: [...b.items, item] } : b),
    })))
  },

  adicionarItemImagemAoQuadro: (quadroId, imagePath, x, y) => {
    const item: ItemImagemQuadro = { id: uuidv4(), type: 'image', imagePath, x, y, width: 200, height: 150 }
    set((s) => updateIdx(s, idx => ({
      ...idx, boards: idx.boards.map(b => b.id === quadroId ? { ...b, items: [...b.items, item] } : b),
    })))
  },

  atualizarItemQuadro: (quadroId, itemId, atualizacoes) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: idx.boards.map(b => b.id === quadroId ? {
      ...b, items: b.items.map(i => i.id === itemId ? ({ ...i, ...atualizacoes } as ItemQuadro) : i),
    } : b),
  }))),

  removerItemDoQuadro: (quadroId, itemId) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: idx.boards.map(b => b.id === quadroId ? {
      ...b,
      items: b.items.filter(i => i.id !== itemId),
      connections: b.connections.filter(c => c.fromItemId !== itemId && c.toItemId !== itemId),
    } : b),
  }))),

  moverItemQuadro: (quadroId, itemId, x, y) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: idx.boards.map(b => b.id === quadroId ? {
      ...b, items: b.items.map(i => i.id === itemId ? { ...i, x, y } : i),
    } : b),
  }))),

  // === Conexões ===
  adicionarConexao: (quadroId, conexao) => {
    const nova: ConexaoQuadro = { ...conexao, id: uuidv4() }
    set((s) => updateIdx(s, idx => ({
      ...idx, boards: idx.boards.map(b => b.id === quadroId ? { ...b, connections: [...b.connections, nova] } : b),
    })))
  },

  atualizarConexao: (quadroId, conexaoId, atualizacoes) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: idx.boards.map(b => b.id === quadroId ? {
      ...b, connections: b.connections.map(c => c.id === conexaoId ? { ...c, ...atualizacoes } : c),
    } : b),
  }))),

  removerConexao: (quadroId, conexaoId) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: idx.boards.map(b => b.id === quadroId ? {
      ...b, connections: b.connections.filter(c => c.id !== conexaoId),
    } : b),
  }))),

  // === Viewport ===
  atualizarViewport: (quadroId, viewport) => set((s) => updateIdx(s, idx => ({
    ...idx, boards: idx.boards.map(b => b.id === quadroId ? { ...b, viewport: { ...b.viewport, ...viewport } } : b),
  }))),

  // === UI ===
  definirAbaAtiva: (aba) => set({ abaAtiva: aba }),
  definirTermoBusca: (termo) => set({ termoBusca: termo }),
  definirFiltroCategoria: (filtro) => set({ filtroCategoria: filtro }),
}))
