import React, { useState } from 'react'
import { ArquivoIndexado, CategoriaArquivo } from '../../types'
import { FileCard } from './FileCard'
import { STRINGS } from '../../constants/strings'
import styles from './CategorySection.module.css'

interface PropsCategorySection {
  categoria: CategoriaArquivo
  titulo: string
  arquivos: ArquivoIndexado[]
  colapsoInicial?: boolean
  fixo?: boolean // Seção "Úteis" não colapsa
}

/**
 * Seção colapsável de arquivos por categoria.
 */
export const CategorySection: React.FC<PropsCategorySection> = ({
  categoria,
  titulo,
  arquivos,
  colapsoInicial = false,
  fixo = false,
}) => {
  const [colapsado, setColapsado] = useState(colapsoInicial)

  if (arquivos.length === 0) return null

  const classeCategoria = {
    useful: styles.secaoUtil,
    potential: styles.secaoPotencial,
    useless: styles.secaoSemUtilidade,
    new: styles.secaoNovo,
  }[categoria]

  return (
    <section className={`${styles.secao} ${classeCategoria}`}>
      {/* Cabeçalho da seção */}
      <div
        className={styles.cabecalho}
        onClick={() => !fixo && setColapsado(!colapsado)}
        style={{ cursor: fixo ? 'default' : 'pointer' }}
      >
        <div className={styles.cabecalhoEsquerda}>
          {/* Ícone da categoria */}
          <span className={styles.iconeCategoria}>
            {categoria === 'useful' && (
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.1l-3.6 1.9.7-4L2.2 5.2l4-.6L8 1z"/>
              </svg>
            )}
            {categoria === 'potential' && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 5v3m0 2v.5" strokeLinecap="round"/>
              </svg>
            )}
            {categoria === 'useless' && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4L4 12"/>
              </svg>
            )}
          </span>
          <h3 className={styles.tituloSecao}>{titulo}</h3>
          <span className={styles.contagem}>{arquivos.length}</span>
        </div>

        {/* Botão colapsar */}
        {!fixo && (
          <button
            className={styles.botaoColapsar}
            onClick={(e) => {
              e.stopPropagation()
              setColapsado(!colapsado)
            }}
            title={colapsado ? 'Expandir' : 'Colapsar'}
          >
            <svg
              viewBox="0 0 12 12"
              fill="currentColor"
              className={colapsado ? styles.chevronColapsado : styles.chevron}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Lista de arquivos */}
      {!colapsado && (
        <div className={styles.lista}>
          {arquivos.map((arquivo) => (
            <FileCard key={arquivo.id} arquivo={arquivo} />
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Seção especial de novos arquivos — com destaque azul.
 */
export const NewFilesSection: React.FC<{ arquivos: ArquivoIndexado[] }> = ({ arquivos }) => {
  if (arquivos.length === 0) return null

  return (
    <section className={`${styles.secao} ${styles.secaoNovo}`}>
      <div className={styles.cabecalho}>
        <div className={styles.cabecalhoEsquerda}>
          <span className={styles.iconeCategoria}>
            <svg viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <h3 className={styles.tituloSecao}>{STRINGS.INDICE_NOVOS_ARQUIVOS}</h3>
          <span className={styles.contagem}>{arquivos.length}</span>
        </div>
      </div>
      <div className={styles.lista}>
        {arquivos.map((arquivo) => (
          <FileCard key={arquivo.id} arquivo={arquivo} />
        ))}
      </div>
    </section>
  )
}
