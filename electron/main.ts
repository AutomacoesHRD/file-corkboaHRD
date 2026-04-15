import { app, BrowserWindow, ipcMain, dialog, shell, IpcMainInvokeEvent } from 'electron'
import path from 'path'
import fs from 'fs'
import { registerFileSystemHandlers } from './ipc/fileSystem'
import { registerDataStoreHandlers } from './ipc/dataStore'
import { registerExportImportHandlers } from './ipc/exportImport'

// Evitar erros de GPU cache em ambientes restritos
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')

// Caminho base para armazenar dados — SEMPRE em %APPDATA%/file-corkboaHRD
// Isso garante persistência mesmo com .exe portátil
export const getDataPath = (): string => {
  const dataDir = path.join(app.getPath('userData'))
  // Garantir que o diretório existe
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  return dataDir
}

export const DATA_FILE = 'corkboard-data.json'

let mainWindow: BrowserWindow | null = null
let isQuitting = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#202020',
      symbolColor: '#FFFFFF',
      height: 40,
    },
    backgroundColor: '#202020',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: true,
  })

  // Carregar a aplicação
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Graceful shutdown: pedir ao renderer para salvar antes de fechar
  mainWindow.on('close', (e) => {
    if (!isQuitting && mainWindow) {
      e.preventDefault()
      // Enviar sinal para renderer salvar
      mainWindow.webContents.send('app:save-and-quit')
      // Timeout de segurança — forçar quit após 3s
      setTimeout(() => {
        isQuitting = true
        mainWindow?.close()
      }, 3000)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC: renderer confirma que salvou, pode fechar
ipcMain.on('app:quit-confirmed', () => {
  isQuitting = true
  mainWindow?.close()
})

function registerWindowHandlers(): void {
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false
  })

  ipcMain.handle('shell:openPath', async (_event: IpcMainInvokeEvent, filePath: string) => {
    return shell.openPath(filePath)
  })

  ipcMain.handle('dialog:selectFolder', async () => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Selecionar Pasta - file-corkboaHRD',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:selectFile', async (_event: IpcMainInvokeEvent, filters?: { name: string; extensions: string[] }[]) => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: filters ?? [{ name: 'Todos os Arquivos', extensions: ['*'] }],
      title: 'Selecionar Arquivo - file-corkboaHRD',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:saveFile', async (_event: IpcMainInvokeEvent, defaultName: string, filters?: { name: string; extensions: string[] }[]) => {
    if (!mainWindow) return null
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: filters ?? [{ name: 'Todos os Arquivos', extensions: ['*'] }],
      title: 'Salvar - file-corkboaHRD',
    })
    if (result.canceled || !result.filePath) return null
    return result.filePath
  })

  ipcMain.handle('fs:exists', (_event: IpcMainInvokeEvent, filePath: string) => {
    return fs.existsSync(filePath)
  })
}

app.whenReady().then(() => {
  createWindow()
  registerWindowHandlers()
  registerFileSystemHandlers()
  registerDataStoreHandlers()
  registerExportImportHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
