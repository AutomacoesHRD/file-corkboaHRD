import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { getDataPath } from '../main'

const MASTER_FILE = 'corkboard-master.json'

function masterPath(): string {
  return path.join(getDataPath(), MASTER_FILE)
}

function indexationPath(id: string): string {
  return path.join(getDataPath(), `indexation-${id}.json`)
}

// Verificar se existe dados antigos (formato v1) para migração
const LEGACY_FILE = 'corkboard-data.json'

export function registerDataStoreHandlers(): void {

  // Carregar dados mestre
  ipcMain.handle('dataStore:loadMaster', async () => {
    try {
      const fp = masterPath()
      if (!fs.existsSync(fp)) {
        return { sucesso: true, dados: null }
      }
      const raw = await fs.promises.readFile(fp, 'utf-8')
      return { sucesso: true, dados: JSON.parse(raw) }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Salvar dados mestre
  ipcMain.handle('dataStore:saveMaster', async (_event, dados: unknown) => {
    try {
      const fp = masterPath()
      const bak = fp + '.bak'
      if (fs.existsSync(fp)) await fs.promises.copyFile(fp, bak)
      await fs.promises.writeFile(fp, JSON.stringify(dados, null, 2), 'utf-8')
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Carregar uma indexação específica
  ipcMain.handle('dataStore:loadIndexation', async (_event, id: string) => {
    try {
      const fp = indexationPath(id)
      if (!fs.existsSync(fp)) {
        return { sucesso: true, dados: null }
      }
      const raw = await fs.promises.readFile(fp, 'utf-8')
      return { sucesso: true, dados: JSON.parse(raw) }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Salvar uma indexação específica
  ipcMain.handle('dataStore:saveIndexation', async (_event, id: string, dados: unknown) => {
    try {
      const fp = indexationPath(id)
      const bak = fp + '.bak'
      if (fs.existsSync(fp)) await fs.promises.copyFile(fp, bak)
      await fs.promises.writeFile(fp, JSON.stringify(dados, null, 2), 'utf-8')
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Deletar uma indexação
  ipcMain.handle('dataStore:deleteIndexation', async (_event, id: string) => {
    try {
      const fp = indexationPath(id)
      if (fs.existsSync(fp)) await fs.promises.unlink(fp)
      const bak = fp + '.bak'
      if (fs.existsSync(bak)) await fs.promises.unlink(bak)
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })

  // Carregar dados legados (v1) para migração
  ipcMain.handle('dataStore:loadLegacy', async () => {
    try {
      const fp = path.join(getDataPath(), LEGACY_FILE)
      if (!fs.existsSync(fp)) {
        return { sucesso: true, dados: null }
      }
      const raw = await fs.promises.readFile(fp, 'utf-8')
      return { sucesso: true, dados: JSON.parse(raw) }
    } catch (erro) {
      return { sucesso: false, erro: String(erro) }
    }
  })
}
