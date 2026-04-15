import React, { useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useSearch } from '../../hooks/useSearch'
import { useAppStore } from '../../stores/appStore'
import { NewFilesSection, CategorySection } from './CategorySection'
import { STRINGS } from '../../constants/strings'
import { ArquivoIndexado } from '../../types'
import styles from './FileList.module.css'

interface PropsBoasVindas {
  onIndexar: () => void
}

/**
 * Tela de boas-vindas para primeira utilização.
 */
const TelaBoasVindas: React.FC<PropsBoasVindas> = ({ onIndexar }) => (
  <div className={styles.boasVindas}>
    <div className={styles.boasVindasConteudo}>
      <div className={styles.boasVindasIcone}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="10" width="48" height="44" rx="6" fill="currentColor" opacity="0.08"/>
          <rect x="8" y="10" width="48" height="44" rx="6" stroke="currentColor" strokeWidth="2"/>
          <rect x="16" y="20" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.4"/>
          <rect x="16" y="27" width="32" height="3" rx="1.5" fill="currentColor" opacity="0.3"/>
          <rect x="16" y="34" width="26" height="3" rx="1.5" fill="currentColor" opacity="0.2"/>
          <circle cx="46" cy="46" r="12" fill="var(--accent-primary)"/>
          <path d="M42 46h8M46 42v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 className={styles.boasVindasTitulo}>{STRINGS.BOASVINDAS_TITULO}</h1>
      <p className={styles.boasVindasSubtitulo}>{STRINGS.BOASVINDAS_SUBTITULO}</p>
      <button className={styles.boasVindasBotao} onClick={onIndexar}>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
          <path d="M10 9a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1v-1a1 1 0 011-1z" fill="white"/>
        </svg>
        {STRINGS.BOASVINDAS_BOTAO}
      </button>
    </div>
  </div>
)

interface PropsFileList {
  onIndexar: () => void
}

/**
 * Lista principal de arquivos com seções por categoria.
 * Usa virtualização para suportar centenas de arquivos sem degradação.
 */
export const FileList: React.FC<PropsFileList> = ({ onIndexar }) => {
  const { indexacao } = useAppStore()
  const { arquivosPorCategoria } = useSearch()

  const { novos, uteis, potenciais, semUtilidade } = arquivosPorCategoria
  const totalArquivos = indexacao?.files.length ?? 0

  // Para virtualização, montamos uma lista flat de "blocos" a renderizar
  // (cada bloco é uma seção inteira — a virtualização é por seção)
  // Para listas muito grandes, considerar virtualizar os cards individuais

  if (totalArquivos === 0) {
    return <TelaBoasVindas onIndexar={onIndexar} />
  }

  // Construir lista de seções visíveis para virtualização
  type Secao =
    | { tipo: 'novos'; arquivos: ArquivoIndexado[] }
    | { tipo: 'uteis'; arquivos: ArquivoIndexado[] }
    | { tipo: 'potenciais'; arquivos: ArquivoIndexado[] }
    | { tipo: 'semUtilidade'; arquivos: ArquivoIndexado[] }

  const secoes: Secao[] = []
  if (novos.length > 0) secoes.push({ tipo: 'novos', arquivos: novos })
  if (uteis.length > 0) secoes.push({ tipo: 'uteis', arquivos: uteis })
  if (potenciais.length > 0) secoes.push({ tipo: 'potenciais', arquivos: potenciais })
  if (semUtilidade.length > 0) secoes.push({ tipo: 'semUtilidade', arquivos: semUtilidade })

  if (secoes.length === 0) {
    return (
      <div className={styles.semResultados}>
        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
          <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
          <path d="M34 34l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/>
        </svg>
        <p>Nenhum arquivo encontrado para esta busca.</p>
      </div>
    )
  }

  return (
    <div className={styles.lista}>
      <Virtuoso
        data={secoes}
        itemContent={(_, secao) => {
          switch (secao.tipo) {
            case 'novos':
              return (
                <div className={styles.secaoWrapper}>
                  <NewFilesSection arquivos={secao.arquivos} />
                </div>
              )
            case 'uteis':
              return (
                <div className={styles.secaoWrapper}>
                  <CategorySection
                    categoria="useful"
                    titulo={STRINGS.CATEGORIA_UTIL}
                    arquivos={secao.arquivos}
                    fixo
                  />
                </div>
              )
            case 'potenciais':
              return (
                <div className={styles.secaoWrapper}>
                  <CategorySection
                    categoria="potential"
                    titulo={STRINGS.CATEGORIA_POTENCIAL}
                    arquivos={secao.arquivos}
                    colapsoInicial={false}
                  />
                </div>
              )
            case 'semUtilidade':
              return (
                <div className={styles.secaoWrapper}>
                  <CategorySection
                    categoria="useless"
                    titulo={STRINGS.CATEGORIA_SEM_UTILIDADE}
                    arquivos={secao.arquivos}
                    colapsoInicial
                  />
                </div>
              )
          }
        }}
        style={{ height: '100%' }}
      />
    </div>
  )
}
