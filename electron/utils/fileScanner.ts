import fs from 'fs'
import path from 'path'
import { calcularHashArquivo } from './fileHash'

export interface ArquivoEscaneado {
  caminhoAbsoluto: string
  nomeOriginal: string
  extensao: string
  tipoArquivo: string
}

// Mapeamento de extensões para tipos descritivos em Português
const TIPOS_ARQUIVO: Record<string, string> = {
  // Documentos
  '.pdf': 'Documento PDF',
  '.doc': 'Documento Word',
  '.docx': 'Documento Word',
  '.odt': 'Documento OpenDocument',
  '.rtf': 'Documento Rich Text',
  '.txt': 'Arquivo de Texto',
  '.md': 'Markdown',

  // Planilhas
  '.xls': 'Planilha Excel',
  '.xlsx': 'Planilha Excel',
  '.ods': 'Planilha OpenDocument',
  '.csv': 'Arquivo CSV',

  // Apresentações
  '.ppt': 'Apresentação PowerPoint',
  '.pptx': 'Apresentação PowerPoint',
  '.odp': 'Apresentação OpenDocument',

  // Imagens
  '.png': 'Imagem PNG',
  '.jpg': 'Imagem JPEG',
  '.jpeg': 'Imagem JPEG',
  '.gif': 'Imagem GIF',
  '.bmp': 'Imagem BMP',
  '.webp': 'Imagem WebP',
  '.svg': 'Imagem SVG',
  '.ico': 'Ícone',
  '.tiff': 'Imagem TIFF',
  '.tif': 'Imagem TIFF',

  // Vídeos
  '.mp4': 'Vídeo MP4',
  '.avi': 'Vídeo AVI',
  '.mov': 'Vídeo MOV',
  '.mkv': 'Vídeo MKV',
  '.wmv': 'Vídeo WMV',
  '.flv': 'Vídeo FLV',
  '.webm': 'Vídeo WebM',

  // Áudio
  '.mp3': 'Áudio MP3',
  '.wav': 'Áudio WAV',
  '.flac': 'Áudio FLAC',
  '.aac': 'Áudio AAC',
  '.ogg': 'Áudio OGG',
  '.wma': 'Áudio WMA',

  // Código
  '.js': 'JavaScript',
  '.jsx': 'JavaScript React',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript React',
  '.py': 'Python',
  '.java': 'Java',
  '.cs': 'C#',
  '.cpp': 'C++',
  '.c': 'C',
  '.h': 'Cabeçalho C/C++',
  '.go': 'Go',
  '.rs': 'Rust',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.json': 'JSON',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.sh': 'Script Shell',
  '.bat': 'Script Batch',
  '.ps1': 'Script PowerShell',

  // Compactados
  '.zip': 'Arquivo ZIP',
  '.rar': 'Arquivo RAR',
  '.7z': 'Arquivo 7-Zip',
  '.tar': 'Arquivo TAR',
  '.gz': 'Arquivo GZip',

  // Banco de dados
  '.db': 'Banco de Dados',
  '.sqlite': 'SQLite',
  '.sql': 'SQL',

  // Executáveis
  '.exe': 'Executável Windows',
  '.msi': 'Instalador Windows',
  '.dll': 'Biblioteca DLL',

  // Outros
  '.cork': 'Quadro CorkBoard',
}

/**
 * Retorna o tipo descritivo do arquivo baseado na extensão.
 */
export function obterTipoArquivo(extensao: string): string {
  return TIPOS_ARQUIVO[extensao.toLowerCase()] ?? 'Arquivo'
}

/**
 * Escaneia um diretório recursivamente até a profundidade especificada.
 * profundidade = 0: apenas arquivos na raiz
 * profundidade = -1: sem limite (todas as subpastas)
 */
export async function escanearPasta(
  caminhoPasta: string,
  profundidadeMaxima: number
): Promise<ArquivoEscaneado[]> {
  const arquivos: ArquivoEscaneado[] = []

  async function escanearRecursivo(caminho: string, profundidadeAtual: number): Promise<void> {
    // Verificar se atingiu o limite de profundidade
    if (profundidadeMaxima !== -1 && profundidadeAtual > profundidadeMaxima) {
      return
    }

    let entradas: fs.Dirent[]
    try {
      entradas = await fs.promises.readdir(caminho, { withFileTypes: true })
    } catch {
      // Pasta inacessível (permissão negada, etc.) — pular silenciosamente
      return
    }

    for (const entrada of entradas) {
      const caminhoCompleto = path.join(caminho, entrada.name)

      if (entrada.isDirectory()) {
        await escanearRecursivo(caminhoCompleto, profundidadeAtual + 1)
      } else if (entrada.isFile()) {
        const extensao = path.extname(entrada.name).toLowerCase()
        arquivos.push({
          caminhoAbsoluto: caminhoCompleto,
          nomeOriginal: entrada.name,
          extensao: extensao || '',
          tipoArquivo: obterTipoArquivo(extensao),
        })
      }
    }
  }

  await escanearRecursivo(caminhoPasta, 0)
  return arquivos
}

/**
 * Busca um arquivo pelo hash SHA-256 dentro de caminhos de busca especificados.
 * Útil para revinculação quando um arquivo foi movido.
 */
export async function buscarArquivoPorHash(
  hashAlvo: string,
  caminhosBusca: string[]
): Promise<string | null> {
  for (const caminhoBusca of caminhosBusca) {
    try {
      const arquivos = await escanearPasta(caminhoBusca, -1)
      for (const arquivo of arquivos) {
        try {
          const hash = await calcularHashArquivo(arquivo.caminhoAbsoluto)
          if (hash === hashAlvo) {
            return arquivo.caminhoAbsoluto
          }
        } catch {
          // Arquivo inacessível — continuar busca
        }
      }
    } catch {
      // Pasta inacessível — continuar busca
    }
  }

  return null
}
