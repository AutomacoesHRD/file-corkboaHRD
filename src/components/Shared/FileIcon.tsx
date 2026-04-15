import React from 'react'

interface PropsFileIcon {
  extensao: string
  tamanho?: number
}

/**
 * Ícone dinâmico baseado na extensão do arquivo.
 * Usa SVGs inline estilizados com cores por tipo.
 */
export const FileIcon: React.FC<PropsFileIcon> = ({ extensao, tamanho = 20 }) => {
  const ext = extensao.toLowerCase()

  const config = obterConfiguracaoIcone(ext)

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Forma do documento */}
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        fill={config.cor}
        opacity="0.15"
      />
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke={config.cor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14 2 14 8 20 8"
        stroke={config.cor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Label da extensão */}
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="700"
        fill={config.cor}
        fontFamily="Segoe UI, system-ui, sans-serif"
      >
        {config.label}
      </text>
    </svg>
  )
}

interface ConfiguracaoIcone {
  cor: string
  label: string
}

function obterConfiguracaoIcone(extensao: string): ConfiguracaoIcone {
  // Documentos — Azul
  if (['.pdf'].includes(extensao)) return { cor: '#E53935', label: 'PDF' }
  if (['.doc', '.docx'].includes(extensao)) return { cor: '#1565C0', label: 'DOC' }
  if (['.odt', '.rtf'].includes(extensao)) return { cor: '#1976D2', label: 'ODT' }
  if (['.txt', '.md'].includes(extensao)) return { cor: '#546E7A', label: 'TXT' }

  // Planilhas — Verde
  if (['.xls', '.xlsx'].includes(extensao)) return { cor: '#2E7D32', label: 'XLS' }
  if (['.ods', '.csv'].includes(extensao)) return { cor: '#388E3C', label: 'CSV' }

  // Apresentações — Laranja
  if (['.ppt', '.pptx'].includes(extensao)) return { cor: '#E65100', label: 'PPT' }
  if (['.odp'].includes(extensao)) return { cor: '#F57C00', label: 'ODP' }

  // Imagens — Roxo
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.tif'].includes(extensao))
    return { cor: '#7B1FA2', label: 'IMG' }
  if (['.svg', '.ico'].includes(extensao)) return { cor: '#9C27B0', label: 'SVG' }

  // Vídeos — Rosa
  if (['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'].includes(extensao))
    return { cor: '#C2185B', label: 'VID' }

  // Áudio — Teal
  if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'].includes(extensao))
    return { cor: '#00838F', label: 'AUD' }

  // Código — Ciano
  if (['.js', '.jsx'].includes(extensao)) return { cor: '#F57F17', label: 'JS' }
  if (['.ts', '.tsx'].includes(extensao)) return { cor: '#1565C0', label: 'TS' }
  if (['.py'].includes(extensao)) return { cor: '#1565C0', label: 'PY' }
  if (['.java'].includes(extensao)) return { cor: '#BF360C', label: 'JAV' }
  if (['.cs'].includes(extensao)) return { cor: '#6A1B9A', label: 'C#' }
  if (['.cpp', '.c', '.h'].includes(extensao)) return { cor: '#0277BD', label: 'C++' }
  if (['.go'].includes(extensao)) return { cor: '#00838F', label: 'GO' }
  if (['.rs'].includes(extensao)) return { cor: '#BF360C', label: 'RS' }
  if (['.php'].includes(extensao)) return { cor: '#4527A0', label: 'PHP' }
  if (['.html'].includes(extensao)) return { cor: '#E65100', label: 'HTM' }
  if (['.css', '.scss'].includes(extensao)) return { cor: '#1565C0', label: 'CSS' }
  if (['.json', '.yaml', '.yml', '.toml'].includes(extensao)) return { cor: '#33691E', label: 'CFG' }
  if (['.sh', '.bat', '.ps1'].includes(extensao)) return { cor: '#37474F', label: 'SH' }

  // Compactados — Amarelo
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(extensao))
    return { cor: '#F9A825', label: 'ZIP' }

  // Banco de dados
  if (['.db', '.sqlite', '.sql'].includes(extensao)) return { cor: '#0277BD', label: 'DB' }

  // Executáveis
  if (['.exe', '.msi'].includes(extensao)) return { cor: '#37474F', label: 'EXE' }

  // Padrão — Cinza
  return { cor: '#607D8B', label: extensao.slice(1, 4).toUpperCase() || 'ARQ' }
}
