# CorkBoard

Indexador de arquivos local para Windows 11 com interface visual inspirada em quadros de cortiça.

## Funcionalidades

- **Indexação de Pastas**: Selecione pastas e configure a profundidade de subpastas a escanear
- **Nomes Memoráveis**: Renomeie arquivos com nomes descritivos sem alterar o arquivo original
- **Categorização**: Organize arquivos como Útil, Potencial ou Sem Utilidade
- **Tags**: Adicione tags coloridas para facilitar busca e filtragem
- **Quadros de Cortiça**: Crie quadros visuais com itens conectados por "fios de lã"
- **Drag-and-Drop**: Arraste arquivos para os quadros diretamente
- **Temas**: Alterne entre tema claro e escuro
- **Exportação `.cork`**: Exporte quadros completos com os arquivos inclusos

## Requisitos

- **Node.js**: 18.x ou superior
- **npm**: 9.x ou superior
- **Windows 11** (recomendado; Windows 10 também funciona)
- **Git**: Para clonar o repositório

## Instalação e Execução

### 1. Instalar Dependências

```bash
npm install
```

> **Nota sobre `tar`**: O módulo `tar` é necessário para exportação de quadros `.cork`. Instale separadamente:
> ```bash
> npm install tar
> npm install --save-dev @types/tar
> ```

### 2. Modo Desenvolvimento

```bash
npm run dev
```

Isso:
1. Compila o processo principal do Electron via Vite (`dist/electron/main.js`)
2. Inicia o servidor Vite (React) na porta `5173`
3. Lança o Electron (aguarda o servidor Vite estar pronto)

> **Importante:** Execute em um terminal normal (PowerShell, CMD, Windows Terminal).  
> Não execute dentro do terminal integrado do Claude Code — ele define `ELECTRON_RUN_AS_NODE=1`  
> internamente, o que impede o Electron de inicializar no modo gráfico.

### 3. Build de Produção

```bash
npm run build
```

### 4. Gerar Instalador Windows

```bash
npm run dist:win
```

O instalador `.exe` será gerado em `release/`.

## Estrutura do Projeto

```
corkboard/
├── electron/               # Processo principal do Electron
│   ├── main.ts             # Entry point do Electron
│   ├── preload.ts          # Bridge IPC segura
│   ├── ipc/                # Handlers IPC
│   │   ├── fileSystem.ts   # Operações de arquivo
│   │   ├── dataStore.ts    # Leitura/escrita do JSON
│   │   └── exportImport.ts # Exportação/importação .cork
│   └── utils/
│       ├── fileHash.ts     # Hash SHA-256 assíncrono
│       └── fileScanner.ts  # Varredura de diretórios
├── src/                    # Frontend React
│   ├── App.tsx             # Componente raiz
│   ├── index.tsx           # Entry point React
│   ├── styles/             # CSS global e temas
│   ├── types/              # Interfaces TypeScript
│   ├── constants/          # Strings e cores
│   ├── stores/             # Zustand store
│   ├── hooks/              # React hooks
│   └── components/
│       ├── Layout/         # Header, TabBar, SearchBar
│       ├── Index/          # FileList, FileCard, etc.
│       ├── Boards/         # BoardCanvas, nodes, etc.
│       └── Shared/         # ContextMenu, ColorPicker, etc.
├── index.html              # HTML da aplicação
├── vite.config.ts          # Configuração Vite
├── tsconfig.json           # TypeScript (renderer)
└── tsconfig.electron.json  # TypeScript (main process)
```

## Dados Persistidos

O arquivo `corkboard-data.json` é salvo no mesmo diretório do executável (modo produção) ou na raiz do projeto (modo desenvolvimento). Um backup automático `.bak` é criado a cada salvamento.

## Atalhos de Teclado

| Ação | Atalho |
|------|--------|
| Navegar pelo canvas (pan) | `Espaço + arrastar` ou `botão do meio + arrastar` |
| Zoom in/out | `Scroll do mouse` |
| Cancelar ação | `Escape` |
| Confirmar input | `Enter` |

## Segurança

- `nodeIntegration` desabilitado no renderer
- `contextIsolation` ativado
- Toda comunicação via `contextBridge` com `ipcRenderer`
- O renderer nunca acessa diretamente o sistema de arquivos

## Desenvolvimento

### Verificar TypeScript

```bash
npm run typecheck
```

### Dependências Principais

| Pacote | Uso |
|--------|-----|
| `electron` | Runtime da aplicação desktop |
| `react` / `react-dom` | Interface do usuário |
| `zustand` | Gerenciamento de estado |
| `react-virtuoso` | Virtualização da lista de arquivos |
| `uuid` | Geração de IDs únicos |
| `vite` | Bundler para o frontend |
| `electron-builder` | Empacotamento e instalador |

## Contribuição

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Inicie o modo desenvolvimento: `npm run dev`
4. Faça suas modificações
5. Teste com `npm run typecheck`
6. Envie um Pull Request

## Licença

MIT — Uso livre para projetos pessoais e comerciais.
