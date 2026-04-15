import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { escanearPasta, buscarArquivoPorHash } from '../utils/fileScanner'
import { calcularHashArquivo } from '../utils/fileHash'

/**
 * Registra todos os handlers IPC relacionados ao sistema de arquivos.
 */
export function registerFileSystemHandlers(): void {
  // Escanear pasta com profundidade especificada
  ipcMain.handle('fs:scanFolder', async (_event, caminhoPasta: string, profundidade: number) => {
    try {
      const arquivos = await escanearPasta(caminhoPasta, profundidade)
      return { sucesso: true, arquivos }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Calcular hash SHA-256 de um arquivo
  ipcMain.handle('fs:getFileHash', async (_event, caminhoArquivo: string) => {
    try {
      const hash = await calcularHashArquivo(caminhoArquivo)
      return { sucesso: true, hash }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Buscar arquivo pelo hash em caminhos de busca
  ipcMain.handle('fs:findFileByHash', async (_event, hash: string, caminhosBusca: string[]) => {
    try {
      const caminhoEncontrado = await buscarArquivoPorHash(hash, caminhosBusca)
      return { sucesso: true, caminho: caminhoEncontrado }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Copiar arquivo de origem para destino
  ipcMain.handle('fs:copyFile', async (_event, origem: string, destino: string) => {
    try {
      // Criar diretório de destino se não existir
      const dirDestino = path.dirname(destino)
      await fs.promises.mkdir(dirDestino, { recursive: true })
      await fs.promises.copyFile(origem, destino)
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Ler imagem como Base64 para exibição no canvas
  ipcMain.handle('fs:readImageAsBase64', async (_event, caminhoImagem: string) => {
    try {
      const buffer = await fs.promises.readFile(caminhoImagem)
      const base64 = buffer.toString('base64')
      const ext = path.extname(caminhoImagem).toLowerCase().slice(1)
      const mimeType = ext === 'jpg' ? 'jpeg' : ext
      return { sucesso: true, dataUrl: `data:image/${mimeType};base64,${base64}` }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })
}
