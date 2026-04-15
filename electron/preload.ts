import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // === Controle de Janela ===
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  // === Shell do Sistema ===
  shell: {
    openPath: (filePath: string) => ipcRenderer.invoke('shell:openPath', filePath),
  },

  // === Diálogos Nativos ===
  dialog: {
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    selectFile: (filters?: { name: string; extensions: string[] }[]) =>
      ipcRenderer.invoke('dialog:selectFile', filters),
    saveFile: (defaultName: string, filters?: { name: string; extensions: string[] }[]) =>
      ipcRenderer.invoke('dialog:saveFile', defaultName, filters),
  },

  // === Sistema de Arquivos ===
  fs: {
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    scanFolder: (folderPath: string, depth: number) =>
      ipcRenderer.invoke('fs:scanFolder', folderPath, depth),
    getFileHash: (filePath: string) => ipcRenderer.invoke('fs:getFileHash', filePath),
    findFileByHash: (hash: string, searchPaths: string[]) =>
      ipcRenderer.invoke('fs:findFileByHash', hash, searchPaths),
    copyFile: (src: string, dest: string) => ipcRenderer.invoke('fs:copyFile', src, dest),
    readImageAsBase64: (imagePath: string) => ipcRenderer.invoke('fs:readImageAsBase64', imagePath),
    getFileSize: (filePath: string) => ipcRenderer.invoke('fs:getFileSize', filePath),
  },

  // === Armazenamento de Dados (multi-indexação) ===
  dataStore: {
    loadMaster: () => ipcRenderer.invoke('dataStore:loadMaster'),
    saveMaster: (data: unknown) => ipcRenderer.invoke('dataStore:saveMaster', data),
    loadIndexation: (id: string) => ipcRenderer.invoke('dataStore:loadIndexation', id),
    saveIndexation: (id: string, data: unknown) => ipcRenderer.invoke('dataStore:saveIndexation', id, data),
    deleteIndexation: (id: string) => ipcRenderer.invoke('dataStore:deleteIndexation', id),
    loadLegacy: () => ipcRenderer.invoke('dataStore:loadLegacy'),
  },

  // === Lifecycle ===
  onSaveAndQuit: (callback: () => void) => {
    ipcRenderer.on('app:save-and-quit', callback)
  },
  confirmQuit: () => ipcRenderer.send('app:quit-confirmed'),

  // === Exportação / Importação ===
  exportImport: {
    exportIndexation: (data: unknown, savePath: string) =>
      ipcRenderer.invoke('exportImport:exportIndexation', data, savePath),
    importIndexation: (filePath: string) =>
      ipcRenderer.invoke('exportImport:importIndexation', filePath),
    exportBoard: (data: unknown, savePath: string) =>
      ipcRenderer.invoke('exportImport:exportBoard', data, savePath),
    importBoard: (corkFilePath: string, destFolder: string) =>
      ipcRenderer.invoke('exportImport:importBoard', corkFilePath, destFolder),
  },
})
