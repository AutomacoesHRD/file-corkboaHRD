import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { DadosMestre, DadosIndexacao } from '../types'
import { v4 as uuidv4 } from 'uuid'

const DEBOUNCE_MS = 1000

/**
 * Hook para carregar e salvar dados (master + indexação ativa).
 * Suporta migração automática de dados v1 (corkboard-data.json).
 */
export function useDataStore() {
  const store = useAppStore()
  const { master, masterCarregado, indexacao, indexacaoCarregada,
    salvarPendente, salvarMasterPendente,
    carregarMaster, carregarIndexacao } = store

  const timerIdx = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerMaster = useRef<ReturnType<typeof setTimeout> | null>(null)
  const salvandoRef = useRef(false)

  // 1) Carregar master na inicialização
  useEffect(() => {
    if (masterCarregado) return
    async function init() {
      try {
        const res = await window.electronAPI.dataStore.loadMaster()
        if (res.sucesso && res.dados) {
          carregarMaster(res.dados)
          return
        }

        // Tentar migrar dados legados (v1)
        const legacy = await window.electronAPI.dataStore.loadLegacy()
        if (legacy.sucesso && legacy.dados && legacy.dados.files?.length > 0) {
          const legacyData = legacy.dados
          const idxId = uuidv4()

          // Inferir rootPath da primeira pasta indexada
          const rootPath = legacyData.indexedFolders?.[0]?.path ?? ''

          const newMaster: DadosMestre = {
            version: '2.0.0',
            activeIndexationId: idxId,
            indexations: [{
              id: idxId,
              name: 'Indexação Migrada',
              rootPath,
              originalRootPath: rootPath,
              createdAt: new Date().toISOString(),
            }],
            settings: legacyData.settings ?? { theme: 'dark', sortMode: 'manual', language: 'pt-BR' as const },
          }

          const newIdx: DadosIndexacao = {
            version: '1.0.0',
            indexedFolders: legacyData.indexedFolders ?? [],
            files: (legacyData.files ?? []).map(f => ({
              ...f,
              relativePath: f.relativePath ?? '',
            })),
            boards: legacyData.boards ?? [],
          }

          // Salvar
          await window.electronAPI.dataStore.saveMaster(newMaster)
          await window.electronAPI.dataStore.saveIndexation(idxId, newIdx)
          carregarMaster(newMaster)
          return
        }

        // Nenhum dado existente — começar do zero
        const freshMaster: DadosMestre = {
          version: '2.0.0',
          activeIndexationId: null,
          indexations: [],
          settings: { theme: 'dark', sortMode: 'manual', language: 'pt-BR' },
        }
        carregarMaster(freshMaster)
      } catch {
        carregarMaster({
          version: '2.0.0',
          activeIndexationId: null,
          indexations: [],
          settings: { theme: 'dark', sortMode: 'manual', language: 'pt-BR' },
        })
      }
    }
    init()
  }, [masterCarregado, carregarMaster])

  // 2) Carregar indexação ativa quando master muda
  useEffect(() => {
    if (!masterCarregado) return

    if (!master.activeIndexationId) {
      // Sem indexação ativa — carregar vazia para que o app funcione
      if (!indexacaoCarregada) {
        carregarIndexacao({ version: '1.0.0', indexedFolders: [], files: [], boards: [] })
      }
      return
    }
    if (indexacaoCarregada) return // Já carregada

    async function loadIdx() {
      const id = master.activeIndexationId!
      const res = await window.electronAPI.dataStore.loadIndexation(id)
      if (res.sucesso && res.dados) {
        carregarIndexacao(res.dados)
      } else {
        carregarIndexacao({ version: '1.0.0', indexedFolders: [], files: [], boards: [] })
      }
    }
    loadIdx()
  }, [masterCarregado, master.activeIndexationId, indexacaoCarregada, carregarIndexacao])

  // 3) Auto-save indexação ativa
  useEffect(() => {
    if (!indexacaoCarregada || !salvarPendente || !master.activeIndexationId || !indexacao) return
    if (timerIdx.current) clearTimeout(timerIdx.current)
    timerIdx.current = setTimeout(async () => {
      if (salvandoRef.current) return
      salvandoRef.current = true
      try {
        await window.electronAPI.dataStore.saveIndexation(master.activeIndexationId!, indexacao)
        useAppStore.setState({ salvarPendente: false })
      } catch { /* retry next cycle */ }
      finally { salvandoRef.current = false }
    }, DEBOUNCE_MS)
    return () => { if (timerIdx.current) clearTimeout(timerIdx.current) }
  }, [salvarPendente, indexacao, indexacaoCarregada, master.activeIndexationId])

  // 4) Auto-save master
  useEffect(() => {
    if (!masterCarregado || !salvarMasterPendente) return
    if (timerMaster.current) clearTimeout(timerMaster.current)
    timerMaster.current = setTimeout(async () => {
      try {
        await window.electronAPI.dataStore.saveMaster(master)
        useAppStore.setState({ salvarMasterPendente: false })
      } catch { /* retry */ }
    }, DEBOUNCE_MS)
    return () => { if (timerMaster.current) clearTimeout(timerMaster.current) }
  }, [salvarMasterPendente, master, masterCarregado])

  const salvarImediatamente = useCallback(async () => {
    if (timerIdx.current) clearTimeout(timerIdx.current)
    if (timerMaster.current) clearTimeout(timerMaster.current)
    const currentMaster = useAppStore.getState().master
    const currentIdx = useAppStore.getState().indexacao
    if (currentMaster.activeIndexationId && currentIdx) {
      await window.electronAPI.dataStore.saveIndexation(currentMaster.activeIndexationId, currentIdx)
    }
    await window.electronAPI.dataStore.saveMaster(currentMaster)
    useAppStore.setState({ salvarPendente: false, salvarMasterPendente: false })
  }, [])

  // Ouvir sinal de graceful shutdown do main process
  useEffect(() => {
    window.electronAPI.onSaveAndQuit(async () => {
      await salvarImediatamente()
      window.electronAPI.confirmQuit()
    })
  }, [salvarImediatamente])

  const pronto = masterCarregado && (indexacaoCarregada || !master.activeIndexationId)

  return { carregado: pronto, salvarImediatamente }
}
