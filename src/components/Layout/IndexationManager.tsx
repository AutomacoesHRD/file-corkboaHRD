import React, { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { Indexacao, MetadadosExportacaoIndexacao, DadosIndexacao } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import styles from './IndexationManager.module.css'

/**
 * Dropdown de gerenciamento de indexações.
 * Permite criar, trocar, renomear, excluir, exportar e importar indexações.
 */
export const IndexationManager: React.FC = () => {
  const store = useAppStore()
  const { master, indexacao } = store
  const [aberto, setAberto] = useState(false)
  const [criando, setCriando] = useState(false)
  const [nomeNova, setNomeNova] = useState('')
  const [renomeandoId, setRenomeandoId] = useState<string | null>(null)
  const [nomeRenomear, setNomeRenomear] = useState('')

  const activeIdx = master.indexations.find(i => i.id === master.activeIndexationId)

  // Criar nova indexação
  const handleCriar = async () => {
    const nome = nomeNova.trim()
    if (!nome) return
    const pasta = await window.electronAPI.dialog.selectFolder()
    if (!pasta) return
    const nova = store.criarIndexacao(nome, pasta)
    // Salvar indexação vazia
    await window.electronAPI.dataStore.saveIndexation(nova.id, {
      version: '1.0.0', indexedFolders: [], files: [], boards: [],
    })
    store.trocarIndexacao(nova.id)
    setCriando(false)
    setNomeNova('')
    setAberto(false)
  }

  // Trocar indexação
  const handleTrocar = async (id: string) => {
    // Salvar indexação atual primeiro
    if (master.activeIndexationId && indexacao) {
      await window.electronAPI.dataStore.saveIndexation(master.activeIndexationId, indexacao)
    }
    store.trocarIndexacao(id)
    setAberto(false)
  }

  // Excluir indexação
  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir esta indexação? Os dados serão perdidos permanentemente.')) return
    await window.electronAPI.dataStore.deleteIndexation(id)
    store.excluirIndexacao(id)
  }

  // Exportar indexação (JSON com metadados, sem arquivos)
  const handleExportar = async () => {
    if (!activeIdx || !indexacao) return
    const savePath = await window.electronAPI.dialog.saveFile(
      `${activeIdx.name}.corkboard-index`,
      [{ name: 'Indexação CorkBoard', extensions: ['corkboard-index'] }]
    )
    if (!savePath) return

    const exportData: MetadadosExportacaoIndexacao = {
      version: '2.0.0',
      type: 'indexation-export',
      indexation: activeIdx,
      data: indexacao,
      exportedAt: new Date().toISOString(),
    }

    const res = await window.electronAPI.exportImport.exportIndexation(exportData, savePath)
    if (res.sucesso) {
      alert('Indexação exportada com sucesso!')
    } else {
      alert(`Erro ao exportar: ${res.erro}`)
    }
  }

  // Importar indexação
  const handleImportar = async () => {
    const filePath = await window.electronAPI.dialog.selectFile([
      { name: 'Indexação CorkBoard', extensions: ['corkboard-index'] },
    ])
    if (!filePath) return

    const res = await window.electronAPI.exportImport.importIndexation(filePath)
    if (!res.sucesso || !res.dados) {
      alert(`Erro ao importar: ${res.erro}`)
      return
    }

    const imported = res.dados as MetadadosExportacaoIndexacao

    // Pedir pasta raiz local equivalente
    alert(`A indexação original foi criada em:\n${imported.indexation.originalRootPath}\n\nSelecione a pasta equivalente no seu computador.`)
    const localRoot = await window.electronAPI.dialog.selectFolder()
    if (!localRoot) return

    // Criar nova indexação com os dados importados
    const newId = uuidv4()
    const newIdx: Indexacao = {
      id: newId,
      name: `${imported.indexation.name} (Importado)`,
      rootPath: localRoot,
      originalRootPath: imported.indexation.originalRootPath,
      createdAt: new Date().toISOString(),
    }

    // Remapear caminhos absolutos dos arquivos
    const originalRoot = imported.indexation.rootPath || imported.indexation.originalRootPath
    const remappedData: DadosIndexacao = {
      ...imported.data,
      files: imported.data.files.map(f => {
        let newAbsPath = f.absolutePath
        if (originalRoot && f.absolutePath.startsWith(originalRoot)) {
          const relative = f.absolutePath.slice(originalRoot.length).replace(/^[\\/]/, '')
          newAbsPath = localRoot + '\\' + relative.replace(/\//g, '\\')
        } else if (f.relativePath) {
          newAbsPath = localRoot + '\\' + f.relativePath.replace(/\//g, '\\')
        }
        return { ...f, absolutePath: newAbsPath }
      }),
      indexedFolders: imported.data.indexedFolders.map(folder => {
        let newPath = folder.path
        if (originalRoot && folder.path.startsWith(originalRoot)) {
          const relative = folder.path.slice(originalRoot.length).replace(/^[\\/]/, '')
          newPath = localRoot + (relative ? '\\' + relative.replace(/\//g, '\\') : '')
        }
        return { ...folder, path: newPath }
      }),
    }

    // Salvar
    await window.electronAPI.dataStore.saveIndexation(newId, remappedData)
    store.importarIndexacaoMeta(newIdx)

    // Trocar para a indexação importada
    if (master.activeIndexationId && indexacao) {
      await window.electronAPI.dataStore.saveIndexation(master.activeIndexationId, indexacao)
    }
    store.trocarIndexacao(newId)
    setAberto(false)
    alert('Indexação importada com sucesso!')
  }

  // Exportar quadro (.cork)
  const handleExportarQuadro = async () => {
    if (!indexacao) return
    const boards = indexacao.boards
    if (boards.length === 0) { alert('Nenhum quadro para exportar.'); return }

    // Pedir qual quadro
    const nomes = boards.map((b, i) => `${i + 1}. ${b.name}`).join('\n')
    const escolha = prompt(`Qual quadro exportar?\n\n${nomes}\n\nDigite o número:`)
    if (!escolha) return
    const idx = parseInt(escolha) - 1
    if (isNaN(idx) || idx < 0 || idx >= boards.length) { alert('Número inválido.'); return }

    const quadro = boards[idx]
    const savePath = await window.electronAPI.dialog.saveFile(
      `${quadro.name}.cork`,
      [{ name: 'Quadro CorkBoard', extensions: ['cork'] }]
    )
    if (!savePath) return

    // Coletar arquivos referenciados
    const filesReferenced = quadro.items
      .filter(i => i.type === 'file')
      .map(i => i.type === 'file' ? indexacao.files.find(f => f.id === (i as { fileId: string }).fileId) : null)
      .filter(Boolean)

    const exportData = {
      version: '2.0.0',
      type: 'board-export',
      board: quadro,
      files: filesReferenced,
      exportedAt: new Date().toISOString(),
    }

    const res = await window.electronAPI.exportImport.exportBoard(exportData, savePath)
    if (res.sucesso) {
      alert('Quadro exportado com sucesso!')
    } else {
      alert(`Erro: ${res.erro}`)
    }
  }

  // Importar quadro (.cork)
  const handleImportarQuadro = async () => {
    const corkPath = await window.electronAPI.dialog.selectFile([
      { name: 'Quadro CorkBoard', extensions: ['cork'] },
    ])
    if (!corkPath) return

    alert('Selecione uma pasta para salvar os arquivos do quadro importado.')
    const destFolder = await window.electronAPI.dialog.selectFolder()
    if (!destFolder) return

    const res = await window.electronAPI.exportImport.importBoard(corkPath, destFolder)
    if (!res.sucesso || !res.dados) {
      alert(`Erro: ${res.erro}`)
      return
    }

    const meta = res.dados as any
    const extractedFiles = res.extractedFiles ?? {}
    const board = meta.board
    const importedFiles = meta.files ?? []

    // Criar pseudo-indexação para este quadro
    const pseudoId = uuidv4()
    const pseudoIdx: Indexacao = {
      id: pseudoId,
      name: `Quadro: ${board.name}`,
      rootPath: destFolder,
      originalRootPath: destFolder,
      createdAt: new Date().toISOString(),
    }

    // Remapear arquivos para os caminhos extraídos
    const remappedFiles = importedFiles.map((f: any) => {
      const key = `files/${f.id}_${f.originalName}`
      return {
        ...f,
        absolutePath: extractedFiles[key] ?? f.absolutePath,
        relativePath: f.relativePath ?? f.originalName,
      }
    })

    // Remapear imagens nos items do quadro
    const remappedItems = board.items.map((item: any) => {
      if (item.type === 'image' && item.imagePath) {
        const key = `images/${item.imagePath.split(/[\\/]/).pop()}`
        return { ...item, imagePath: extractedFiles[key] ?? item.imagePath, imageDataUrl: undefined }
      }
      return item
    })

    const pseudoData: DadosIndexacao = {
      version: '1.0.0',
      indexedFolders: [{ id: uuidv4(), path: destFolder, depth: 0, lastScanned: new Date().toISOString() }],
      files: remappedFiles,
      boards: [{ ...board, id: uuidv4(), items: remappedItems }],
    }

    await window.electronAPI.dataStore.saveIndexation(pseudoId, pseudoData)
    store.importarIndexacaoMeta(pseudoIdx)

    if (master.activeIndexationId && indexacao) {
      await window.electronAPI.dataStore.saveIndexation(master.activeIndexationId, indexacao)
    }
    store.trocarIndexacao(pseudoId)
    setAberto(false)
    alert('Quadro importado com sucesso!')
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.trigger} onClick={() => setAberto(!aberto)} title="Gerenciar Indexações">
        <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}>
          <path d="M1 3h14v1.5H1V3zm0 4h14v1.5H1V7zm0 4h10v1.5H1V11z"/>
        </svg>
        <span className={styles.triggerLabel}>
          {activeIdx?.name ?? 'Sem indexação'}
        </span>
        <svg viewBox="0 0 10 6" fill="currentColor" style={{ width: 8, height: 8 }}>
          <path d="M0 0l5 6 5-6z"/>
        </svg>
      </button>

      {aberto && (
        <>
          <div className={styles.overlay} onClick={() => setAberto(false)} />
          <div className={styles.dropdown}>
            {/* Lista de indexações */}
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Indexações</span>
              {master.indexations.length === 0 && (
                <span className={styles.empty}>Nenhuma indexação criada</span>
              )}
              {master.indexations.map(idx => (
                <div key={idx.id} className={`${styles.item} ${idx.id === master.activeIndexationId ? styles.itemActive : ''}`}>
                  {renomeandoId === idx.id ? (
                    <input
                      className={styles.renameInput}
                      value={nomeRenomear}
                      onChange={e => setNomeRenomear(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { store.renomearIndexacao(idx.id, nomeRenomear.trim() || idx.name); setRenomeandoId(null) }
                        if (e.key === 'Escape') setRenomeandoId(null)
                      }}
                      onBlur={() => { store.renomearIndexacao(idx.id, nomeRenomear.trim() || idx.name); setRenomeandoId(null) }}
                      autoFocus
                    />
                  ) : (
                    <button className={styles.itemBtn} onClick={() => handleTrocar(idx.id)}>
                      {idx.name}
                      <span className={styles.itemPath} title={idx.rootPath}>{idx.rootPath}</span>
                    </button>
                  )}
                  <button className={styles.miniBtn} onClick={() => { setNomeRenomear(idx.name); setRenomeandoId(idx.id) }} title="Renomear">✎</button>
                  <button className={styles.miniBtn} onClick={() => handleExcluir(idx.id)} title="Excluir">×</button>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            {/* Criar nova */}
            {criando ? (
              <div className={styles.createRow}>
                <input
                  className={styles.createInput}
                  placeholder="Nome da indexação..."
                  value={nomeNova}
                  onChange={e => setNomeNova(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCriar(); if (e.key === 'Escape') setCriando(false) }}
                  autoFocus
                />
                <button className={styles.createBtn} onClick={handleCriar}>Criar</button>
              </div>
            ) : (
              <button className={styles.actionBtn} onClick={() => setCriando(true)}>+ Nova Indexação</button>
            )}

            <div className={styles.divider} />

            {/* Import/Export */}
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Transferir</span>
              {activeIdx && <button className={styles.actionBtn} onClick={handleExportar}>Exportar Indexação</button>}
              <button className={styles.actionBtn} onClick={handleImportar}>Importar Indexação</button>
              {activeIdx && <button className={styles.actionBtn} onClick={handleExportarQuadro}>Exportar Quadro (.cork)</button>}
              <button className={styles.actionBtn} onClick={handleImportarQuadro}>Importar Quadro (.cork)</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
