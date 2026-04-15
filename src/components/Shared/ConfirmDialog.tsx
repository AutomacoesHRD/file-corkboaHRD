import React from 'react'
import { STRINGS } from '../../constants/strings'
import styles from './ConfirmDialog.module.css'

interface PropsConfirmDialog {
  titulo: string
  mensagem?: string
  textoBotaoConfirmar?: string
  textoBotaoCancelar?: string
  perigo?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

/**
 * Diálogo de confirmação modal com estilo Fluent UI.
 */
export const ConfirmDialog: React.FC<PropsConfirmDialog> = ({
  titulo,
  mensagem,
  textoBotaoConfirmar = STRINGS.CONFIRMAR,
  textoBotaoCancelar = STRINGS.CANCELAR,
  perigo = false,
  onConfirmar,
  onCancelar,
}) => {
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className={styles.dialogo}>
        <h2 className={styles.titulo}>{titulo}</h2>
        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
        <div className={styles.acoes}>
          <button className={styles.botaoCancelar} onClick={onCancelar}>
            {textoBotaoCancelar}
          </button>
          <button
            className={`${styles.botaoConfirmar} ${perigo ? styles.botaoPerigo : ''}`}
            onClick={onConfirmar}
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
