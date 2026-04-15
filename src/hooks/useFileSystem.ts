import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useAppStore } from '../stores/appStore'
import { ArquivoIndexado, CategoriaArquivo, PastaIndexada, ResultadoEscaneamento } from '../types'

export function useFileSystem() {
  const {
    indexacao,
    master,
    adicionarPasta,
    adicionarArquivos,
    atualizarArquivo,
  } = useAppStore()

  const files = indexacao?.files ?? []
  const folders = indexacao?.indexedFolders ?? []

  // Obter rootPath da indexação ativa
  const activeIdx = master.indexations.find(i => i.id === master.activeIndexationId)
  const rootPath = activeIdx?.rootPath ?? ''

  const selecionarPasta = useCallback(async () => {
    return await window.electronAPI.dialog.selectFolder()
  }, [])

  const indexarPasta = useCallback(async (
    caminhoPasta: string,
    profundidade: number
  ): Promise<ArquivoIndexado[]> => {
    const resultado = await window.electronAPI.fs.scanFolder(caminhoPasta, profundidade)
    if (!resultado.sucesso || !resultado.arquivos) {
      throw new Error(resultado.erro ?? 'Erro ao escanear pasta')
    }

    const caminhoExistentes = new Set(files.map(f => f.absolutePath))
    const agora = new Date().toISOString()

    const pastaExistente = folders.find(p => p.path === caminhoPasta)
    let pastaId: string

    if (pastaExistente) {
      pastaId = pastaExistente.id
    } else {
      pastaId = uuidv4()
      const novaPasta: PastaIndexada = {
        id: pastaId,
        path: caminhoPasta,
        depth: profundidade,
        lastScanned: agora,
      }
      adicionarPasta(novaPasta)
    }

    const novosArquivos: ArquivoIndexado[] = resultado.arquivos
      .filter(a => !caminhoExistentes.has(a.caminhoAbsoluto))
      .map((a, index) => {
        // Calcular caminho relativo à raiz da indexação
        let relativePath = a.caminhoAbsoluto
        if (rootPath && a.caminhoAbsoluto.toLowerCase().startsWith(rootPath.toLowerCase())) {
          relativePath = a.caminhoAbsoluto.slice(rootPath.length).replace(/^[\\/]/, '')
        }

        return {
          id: uuidv4(),
          originalName: a.nomeOriginal,
          memorableName: '',
          extension: a.extensao,
          fileType: a.tipoArquivo,
          absolutePath: a.caminhoAbsoluto,
          relativePath,
          contentHash: '',
          category: 'new' as CategoriaArquivo,
          tags: [],
          isDeleted: false,
          needsRelink: false,
          sortOrder: index,
          folderId: pastaId,
          createdAt: agora,
          updatedAt: agora,
        }
      })

    if (novosArquivos.length > 0) {
      adicionarArquivos(novosArquivos)
    }

    return novosArquivos
  }, [files, folders, rootPath, adicionarPasta, adicionarArquivos])

  const verificarEstadoArquivos = useCallback(async (): Promise<ResultadoEscaneamento> => {
    const resultado: ResultadoEscaneamento = {
      novosArquivos: [],
      arquivosRemovidos: [],
      arquivosMovidos: [],
    }

    const arquivosParaVerificar = files.filter(f => !f.isDeleted)

    for (const arquivo of arquivosParaVerificar) {
      const existe = await window.electronAPI.fs.exists(arquivo.absolutePath)
      if (!existe && !arquivo.isDeleted) {
        atualizarArquivo(arquivo.id, { isDeleted: true, needsRelink: false })
        resultado.arquivosRemovidos.push(arquivo.id)
      } else if (existe && arquivo.isDeleted) {
        atualizarArquivo(arquivo.id, { isDeleted: false })
      }
    }

    return resultado
  }, [files, atualizarArquivo])

  const abrirArquivo = useCallback(async (caminhoArquivo: string): Promise<boolean> => {
    const erro = await window.electronAPI.shell.openPath(caminhoArquivo)
    return erro === ''
  }, [])

  const revincularArquivo = useCallback(async (arquivoId: string): Promise<boolean> => {
    const arquivo = files.find(f => f.id === arquivoId)
    if (!arquivo) return false

    const filtros = arquivo.extension
      ? [
          { name: `Arquivos ${arquivo.extension.toUpperCase()}`, extensions: [arquivo.extension.slice(1)] },
          { name: 'Todos os Arquivos', extensions: ['*'] },
        ]
      : [{ name: 'Todos os Arquivos', extensions: ['*'] }]

    const novoCaminho = await window.electronAPI.dialog.selectFile(filtros)
    if (!novoCaminho) return false

    atualizarArquivo(arquivoId, { absolutePath: novoCaminho, isDeleted: false, needsRelink: false })
    return true
  }, [files, atualizarArquivo])

  return {
    selecionarPasta,
    indexarPasta,
    verificarEstadoArquivos,
    abrirArquivo,
    revincularArquivo,
  }
}
