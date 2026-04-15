import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '../stores/appStore'
import { ArquivoIndexado, CategoriaArquivo } from '../types'

const DEBOUNCE_MS = 300

export function useSearch() {
  const { termoBusca, filtroCategoria, indexacao, modoOrdenacao } = useAppStore()
  const [termoDebouncado, setTermoDebouncado] = useState(termoBusca)

  useEffect(() => {
    const timer = setTimeout(() => setTermoDebouncado(termoBusca), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [termoBusca])

  const files = indexacao?.files ?? []

  const arquivosFiltrados = useMemo(() => {
    let arquivos = files

    if (filtroCategoria !== 'all') {
      arquivos = arquivos.filter(f => f.category === filtroCategoria)
    }

    if (termoDebouncado.trim()) {
      const termo = termoDebouncado.toLowerCase().trim()
      arquivos = arquivos.filter(f => {
        return f.originalName.toLowerCase().includes(termo) ||
          (f.memorableName?.toLowerCase().includes(termo) ?? false) ||
          f.tags.some(tag => tag.toLowerCase().includes(termo))
      })
    }

    return arquivos
  }, [files, filtroCategoria, termoDebouncado])

  const arquivosPorCategoria = useMemo(() => {
    const ordenar = (lista: ArquivoIndexado[]): ArquivoIndexado[] => {
      if (modoOrdenacao === 'alphabetical') {
        return [...lista].sort((a, b) => {
          const nomeA = a.memorableName || a.originalName
          const nomeB = b.memorableName || b.originalName
          return nomeA.localeCompare(nomeB, 'pt-BR')
        })
      }
      return [...lista].sort((a, b) => a.sortOrder - b.sortOrder)
    }

    const categorias: Record<CategoriaArquivo, ArquivoIndexado[]> = {
      new: [], useful: [], potential: [], useless: [],
    }

    for (const arquivo of arquivosFiltrados) {
      categorias[arquivo.category].push(arquivo)
    }

    return {
      novos: ordenar(categorias.new),
      uteis: ordenar(categorias.useful),
      potenciais: ordenar(categorias.potential),
      semUtilidade: ordenar(categorias.useless),
    }
  }, [arquivosFiltrados, modoOrdenacao])

  return {
    arquivosFiltrados,
    arquivosPorCategoria,
    temBusca: termoDebouncado.trim().length > 0,
  }
}
