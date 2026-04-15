import crypto from 'crypto'
import fs from 'fs'

/**
 * Calcula o hash SHA-256 de um arquivo de forma assíncrona e em streaming.
 * Não bloqueia a thread principal para arquivos grandes.
 */
export function calcularHashArquivo(caminhoArquivo: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(caminhoArquivo)

    stream.on('data', (chunk) => {
      hash.update(chunk)
    })

    stream.on('end', () => {
      resolve(`sha256-${hash.digest('hex')}`)
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Calcula hash de múltiplos arquivos em paralelo com limite de concorrência.
 */
export async function calcularHashesEmLote(
  caminhos: string[],
  concorrencia = 5
): Promise<Map<string, string>> {
  const resultados = new Map<string, string>()

  // Processar em lotes para não sobrecarregar o sistema
  for (let i = 0; i < caminhos.length; i += concorrencia) {
    const lote = caminhos.slice(i, i + concorrencia)
    const promessas = lote.map(async (caminho) => {
      try {
        const hash = await calcularHashArquivo(caminho)
        resultados.set(caminho, hash)
      } catch {
        // Arquivo inacessível — não registrar hash
        resultados.set(caminho, '')
      }
    })
    await Promise.all(promessas)
  }

  return resultados
}
