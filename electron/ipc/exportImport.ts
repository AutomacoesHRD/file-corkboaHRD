import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

const MAX_CORK_SIZE_BYTES = 2 * 1024 * 1024 * 1024 // 2GB

export function registerExportImportHandlers(): void {

  // === Exportar indexação (JSON com metadados, sem arquivos) ===
  ipcMain.handle('exportImport:exportIndexation', async (_event, data: unknown, savePath: string) => {
    try {
      await fs.promises.writeFile(savePath, JSON.stringify(data, null, 2), 'utf-8')
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // === Importar indexação (ler JSON) ===
  ipcMain.handle('exportImport:importIndexation', async (_event, filePath: string) => {
    try {
      const raw = await fs.promises.readFile(filePath, 'utf-8')
      const dados = JSON.parse(raw)
      if (dados.type !== 'indexation-export') {
        return { sucesso: false, erro: 'Arquivo inválido: não é uma exportação de indexação CorkBoard' }
      }
      return { sucesso: true, dados }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // === Exportar quadro (.cork = tar.gz com arquivos) ===
  ipcMain.handle('exportImport:exportBoard', async (_event, data: unknown, savePath: string) => {
    try {
      const meta = data as {
        board: { items: Array<{ type: string; fileId?: string; imagePath?: string }> }
        files: Array<{ absolutePath: string; originalName: string; id: string }>
      }

      // Verificar tamanho total dos arquivos
      let totalSize = 0
      const filesToCopy: { src: string; dest: string }[] = []

      for (const file of meta.files ?? []) {
        if (fs.existsSync(file.absolutePath)) {
          const stat = await fs.promises.stat(file.absolutePath)
          totalSize += stat.size
          filesToCopy.push({ src: file.absolutePath, dest: `files/${file.id}_${file.originalName}` })
        }
      }

      // Imagens externas
      for (const item of meta.board.items ?? []) {
        if (item.type === 'image' && item.imagePath && fs.existsSync(item.imagePath)) {
          const stat = await fs.promises.stat(item.imagePath)
          totalSize += stat.size
          filesToCopy.push({ src: item.imagePath, dest: `images/${path.basename(item.imagePath)}` })
        }
      }

      if (totalSize > MAX_CORK_SIZE_BYTES) {
        const sizeMB = Math.round(totalSize / 1024 / 1024)
        return { sucesso: false, erro: `Tamanho total (${sizeMB}MB) excede o limite de 2GB` }
      }

      // Montar em diretório temporário
      const tmpDir = path.join(path.dirname(savePath), `.cork_tmp_${Date.now()}`)
      await fs.promises.mkdir(tmpDir, { recursive: true })
      await fs.promises.mkdir(path.join(tmpDir, 'files'), { recursive: true })
      await fs.promises.mkdir(path.join(tmpDir, 'images'), { recursive: true })

      try {
        // Metadados
        await fs.promises.writeFile(path.join(tmpDir, 'metadata.json'), JSON.stringify(data, null, 2), 'utf-8')

        // Copiar arquivos
        for (const { src, dest } of filesToCopy) {
          const fullDest = path.join(tmpDir, dest)
          await fs.promises.mkdir(path.dirname(fullDest), { recursive: true })
          await fs.promises.copyFile(src, fullDest)
        }

        // Criar tar.gz
        const tar = await import('tar')
        await tar.create({ gzip: true, file: savePath, cwd: tmpDir }, ['.'])

        return { sucesso: true }
      } finally {
        await fs.promises.rm(tmpDir, { recursive: true, force: true })
      }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // === Importar quadro (.cork) ===
  ipcMain.handle('exportImport:importBoard', async (_event, corkPath: string, destFolder: string) => {
    try {
      const tmpDir = path.join(destFolder, `.cork_import_${Date.now()}`)
      await fs.promises.mkdir(tmpDir, { recursive: true })

      try {
        // Extrair
        const tar = await import('tar')
        await tar.extract({ file: corkPath, cwd: tmpDir })

        // Ler metadados
        const metaPath = path.join(tmpDir, 'metadata.json')
        if (!fs.existsSync(metaPath)) {
          return { sucesso: false, erro: 'Arquivo .cork inválido: metadata.json não encontrado' }
        }
        const dados = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8'))

        // Copiar arquivos extraídos para a pasta destino
        const extractedFiles: Record<string, string> = {}

        // files/
        const filesDir = path.join(tmpDir, 'files')
        if (fs.existsSync(filesDir)) {
          const entries = await fs.promises.readdir(filesDir)
          for (const entry of entries) {
            const src = path.join(filesDir, entry)
            const dest = path.join(destFolder, entry)
            await fs.promises.copyFile(src, dest)
            extractedFiles[`files/${entry}`] = dest
          }
        }

        // images/
        const imagesDir = path.join(tmpDir, 'images')
        if (fs.existsSync(imagesDir)) {
          const entries = await fs.promises.readdir(imagesDir)
          for (const entry of entries) {
            const src = path.join(imagesDir, entry)
            const dest = path.join(destFolder, entry)
            await fs.promises.copyFile(src, dest)
            extractedFiles[`images/${entry}`] = dest
          }
        }

        return { sucesso: true, dados, extractedFiles }
      } finally {
        await fs.promises.rm(tmpDir, { recursive: true, force: true })
      }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // === Helper: obter tamanho de arquivo ===
  ipcMain.handle('fs:getFileSize', async (_event, filePath: string) => {
    try {
      const stat = await fs.promises.stat(filePath)
      return { sucesso: true, size: stat.size }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })
}
