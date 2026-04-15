// ============================================================
// Tipos TypeScript para todos os modelos de dados do CorkBoard
// ============================================================

// --- Categorias de Arquivo ---
export type CategoriaArquivo = 'useful' | 'potential' | 'useless' | 'new'

// --- Pasta Indexada ---
export interface PastaIndexada {
  id: string
  path: string
  depth: number
  lastScanned: string // ISO 8601
}

// --- Arquivo Indexado ---
export interface ArquivoIndexado {
  id: string
  originalName: string
  memorableName: string
  extension: string
  fileType: string
  absolutePath: string
  relativePath: string  // caminho relativo à raiz da indexação
  contentHash: string
  category: CategoriaArquivo
  tags: string[]
  isDeleted: boolean
  needsRelink: boolean
  sortOrder: number
  folderId: string
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601
}

// --- Tipos de Item no Quadro ---
export type TipoItemQuadro = 'file' | 'note' | 'image'

export interface ItemQuadroBase {
  id: string
  x: number
  y: number
  type: TipoItemQuadro
}

export interface ItemArquivoQuadro extends ItemQuadroBase {
  type: 'file'
  fileId: string
}

export interface ItemNotaQuadro extends ItemQuadroBase {
  type: 'note'
  content: string
  color: string
}

export interface ItemImagemQuadro extends ItemQuadroBase {
  type: 'image'
  imagePath: string
  imageDataUrl?: string
  width?: number
  height?: number
}

export type ItemQuadro = ItemArquivoQuadro | ItemNotaQuadro | ItemImagemQuadro

// --- Conexão entre Itens (Fio de Lã) ---
export interface ConexaoQuadro {
  id: string
  fromItemId: string
  toItemId: string
  color: string
  label?: string
}

// --- Viewport do Canvas ---
export interface ViewportQuadro {
  zoom: number
  panX: number
  panY: number
}

// --- Quadro de Cortiça ---
export interface QuadroCortica {
  id: string
  name: string
  items: ItemQuadro[]
  connections: ConexaoQuadro[]
  viewport: ViewportQuadro
  createdAt: string
}

// --- Configurações da Aplicação ---
export type TemaApp = 'dark' | 'light'
export type ModoOrdenacao = 'manual' | 'alphabetical'

export interface ConfiguracoesApp {
  theme: TemaApp
  sortMode: ModoOrdenacao
  language: 'pt-BR'
}

// --- Indexação (uma coleção independente de pastas/arquivos/quadros) ---
export interface Indexacao {
  id: string
  name: string
  rootPath: string       // pasta raiz desta indexação no PC atual
  originalRootPath: string // pasta raiz original (do PC que criou)
  createdAt: string
}

// --- Dados de uma Indexação individual ---
export interface DadosIndexacao {
  version: string
  indexedFolders: PastaIndexada[]
  files: ArquivoIndexado[]
  boards: QuadroCortica[]
}

// --- Estrutura Principal (mestre) ---
export interface DadosMestre {
  version: string
  activeIndexationId: string | null
  indexations: Indexacao[]
  settings: ConfiguracoesApp
}

// Compatibilidade — tipo antigo (para migração)
export interface DadosCorkBoard {
  version: string
  indexedFolders: PastaIndexada[]
  files: ArquivoIndexado[]
  boards: QuadroCortica[]
  settings: ConfiguracoesApp
}

// --- Resultado de Escaneamento ---
export interface ResultadoEscaneamento {
  novosArquivos: ArquivoIndexado[]
  arquivosRemovidos: string[]
  arquivosMovidos: string[]
}

// --- Estado da Conexão sendo desenhada ---
export interface ConexaoEmAndamento {
  fromItemId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

// --- Metadados de exportação de indexação ---
export interface MetadadosExportacaoIndexacao {
  version: string
  type: 'indexation-export'
  indexation: Indexacao
  data: DadosIndexacao
  exportedAt: string
}

// --- Metadados de exportação de quadro (.cork) ---
export interface MetadadosExportacaoQuadro {
  version: string
  type: 'board-export'
  board: QuadroCortica
  files: ArquivoIndexado[]  // metadados dos arquivos referenciados
  exportedAt: string
}

// --- Tipos para o Electron API (window.electronAPI) ---
export interface ElectronAPI {
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    isMaximized: () => Promise<boolean>
  }
  shell: {
    openPath: (filePath: string) => Promise<string>
  }
  dialog: {
    selectFolder: () => Promise<string | null>
    selectFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>
    saveFile: (defaultName: string, filters?: { name: string; extensions: string[] }[]) => Promise<string | null>
  }
  fs: {
    exists: (filePath: string) => Promise<boolean>
    scanFolder: (folderPath: string, depth: number) => Promise<{
      sucesso: boolean
      arquivos?: Array<{
        caminhoAbsoluto: string
        nomeOriginal: string
        extensao: string
        tipoArquivo: string
      }>
      erro?: string
    }>
    getFileHash: (filePath: string) => Promise<{ sucesso: boolean; hash?: string; erro?: string }>
    findFileByHash: (hash: string, searchPaths: string[]) => Promise<{ sucesso: boolean; caminho?: string | null; erro?: string }>
    copyFile: (src: string, dest: string) => Promise<{ sucesso: boolean; erro?: string }>
    readImageAsBase64: (imagePath: string) => Promise<{ sucesso: boolean; dataUrl?: string; erro?: string }>
    getFileSize: (filePath: string) => Promise<{ sucesso: boolean; size?: number; erro?: string }>
  }
  onSaveAndQuit: (callback: () => void) => void
  confirmQuit: () => void

  dataStore: {
    loadMaster: () => Promise<{ sucesso: boolean; dados?: DadosMestre; erro?: string }>
    saveMaster: (data: DadosMestre) => Promise<{ sucesso: boolean; erro?: string }>
    loadIndexation: (id: string) => Promise<{ sucesso: boolean; dados?: DadosIndexacao; erro?: string }>
    saveIndexation: (id: string, data: DadosIndexacao) => Promise<{ sucesso: boolean; erro?: string }>
    deleteIndexation: (id: string) => Promise<{ sucesso: boolean; erro?: string }>
    // Compatibilidade: migrar dados antigos
    loadLegacy: () => Promise<{ sucesso: boolean; dados?: DadosCorkBoard; erro?: string }>
  }
  exportImport: {
    exportIndexation: (data: MetadadosExportacaoIndexacao, savePath: string) => Promise<{ sucesso: boolean; erro?: string }>
    importIndexation: (filePath: string) => Promise<{ sucesso: boolean; dados?: MetadadosExportacaoIndexacao; erro?: string }>
    exportBoard: (data: MetadadosExportacaoQuadro, savePath: string, maxSizeMB?: number) => Promise<{ sucesso: boolean; erro?: string }>
    importBoard: (corkFilePath: string, destFolder: string) => Promise<{
      sucesso: boolean
      dados?: MetadadosExportacaoQuadro
      extractedFiles?: Record<string, string>  // originalRelPath → newAbsPath
      erro?: string
    }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
