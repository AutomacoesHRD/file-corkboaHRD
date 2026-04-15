/**
 * Constantes de strings da interface em Português (Brasil).
 * Centralizado aqui para facilitar manutenção e possível internacionalização futura.
 */

export const STRINGS = {
  // === Geral ===
  APP_NOME: 'file-corkboaHRD',
  CARREGANDO: 'Carregando...',
  SALVAR: 'Salvar',
  CANCELAR: 'Cancelar',
  CONFIRMAR: 'Confirmar',
  EXCLUIR: 'Excluir',
  RENOMEAR: 'Renomear',
  DUPLICAR: 'Duplicar',
  EXPORTAR: 'Exportar',
  IMPORTAR: 'Importar',
  FECHAR: 'Fechar',
  EDITAR: 'Editar',
  ADICIONAR: 'Adicionar',
  ABRIR: 'Abrir',
  BUSCAR: 'Buscar',
  CONFIRMAR_EXCLUSAO: 'Tem certeza que deseja excluir?',
  ACAO_IRREVERSIVEL: 'Esta ação não pode ser desfeita.',

  // === Header ===
  INDEXAR_PASTA: 'Indexar Pasta',
  REESCANEAR: 'Reescanear',
  TEMA_CLARO: 'Tema Claro',
  TEMA_ESCURO: 'Tema Escuro',

  // === Abas ===
  ABA_INDICE: 'Índice',
  ABA_QUADROS: 'Quadros',

  // === Tela de Boas-vindas ===
  BOASVINDAS_TITULO: 'Bem-vindo ao file-corkboaHRD',
  BOASVINDAS_SUBTITULO: 'Organize seus arquivos locais com nomes memoráveis e quadros visuais.',
  BOASVINDAS_BOTAO: 'Indexar sua primeira pasta',

  // === Seleção de Profundidade ===
  PROFUNDIDADE_TITULO: 'Profundidade de Subpastas',
  PROFUNDIDADE_PERGUNTA: 'Quantos níveis de subpastas deseja indexar?',
  PROFUNDIDADE_APENAS_RAIZ: 'Apenas raiz (0)',
  PROFUNDIDADE_TODAS: 'Todas as subpastas',
  PROFUNDIDADE_NIVEL: (n: number) => `${n} nível${n > 1 ? 's' : ''}`,
  PROFUNDIDADE_CONFIRMAR: 'Indexar',

  // === Aba Índice ===
  INDICE_BUSCA_PLACEHOLDER: 'Buscar por nome, tag...',
  INDICE_ORDEM_MANUAL: 'Ordem Manual',
  INDICE_ORDEM_ALFABETICA: 'Ordem Alfabética',
  INDICE_FILTRAR: 'Filtrar',
  INDICE_NOVOS_ARQUIVOS: 'Novos Arquivos Encontrados',
  INDICE_NOVOS_ARQUIVOS_VAZIO: 'Nenhum novo arquivo encontrado.',

  // === Categorias ===
  CATEGORIA_UTIL: 'Útil',
  CATEGORIA_POTENCIAL: 'Potencial',
  CATEGORIA_SEM_UTILIDADE: 'Sem Utilidade',
  CATEGORIA_NOVO: 'Novo',

  // === Card de Arquivo ===
  CARD_NOMEAR_PLACEHOLDER: 'Clique para nomear...',
  CARD_ARQUIVO_NAO_ENCONTRADO: 'Arquivo não encontrado',
  CARD_REVINCULAR: 'Revincular',
  CARD_ABRIR_ARQUIVO: 'Abrir Arquivo',
  CARD_VER_NO_INDICE: 'Ver no Índice',
  CARD_REMOVER_QUADRO: 'Remover do Quadro',
  CARD_ADICIONAR_TAG: 'Adicionar tag',
  CARD_TAG_PLACEHOLDER: 'Nova tag...',
  CARD_TOOLTIP_DELETADO: 'Este arquivo foi removido do sistema',

  // === Quadros ===
  QUADROS_TITULO: 'Quadros',
  QUADROS_NOVO: 'Novo Quadro',
  QUADROS_NOVO_PLACEHOLDER: 'Nome do quadro...',
  QUADROS_ITENS: (n: number) => `${n} item${n !== 1 ? 's' : ''}`,
  QUADROS_ABRIR_TODOS: 'Abrir Todos os Arquivos',
  QUADROS_VOLTAR: '← Quadros',
  QUADROS_VAZIO_TITULO: 'Nenhum quadro criado',
  QUADROS_VAZIO_SUBTITULO: 'Crie seu primeiro quadro para começar a organizar seus arquivos visualmente.',

  // === Canvas do Quadro ===
  CANVAS_ZOOM: 'Zoom',
  CANVAS_AJUSTAR_TELA: 'Ajustar à Tela',
  CANVAS_ADICIONAR_ARQUIVO: 'Adicionar Arquivo',
  CANVAS_ADICIONAR_NOTA: 'Adicionar Nota',
  CANVAS_ADICIONAR_IMAGEM: 'Adicionar Imagem',
  CANVAS_NOTA_PLACEHOLDER: 'Escreva uma nota...',
  CANVAS_CONEXAO_ROTULO_PLACEHOLDER: 'Rótulo da conexão...',
  CANVAS_REMOVER_CONEXAO: 'Remover Conexão',
  CANVAS_EDITAR_ROTULO: 'Editar Rótulo',
  CANVAS_ALTERAR_COR: 'Alterar Cor',
  CANVAS_ARRASTAR_INSTRUCAO: 'Arraste arquivos da lista lateral para o quadro',

  // === Painel Lateral do Canvas ===
  SIDEBAR_TITULO: 'Arquivos',
  SIDEBAR_BUSCA_PLACEHOLDER: 'Buscar arquivo...',
  SIDEBAR_ARRASTAR_INSTRUCAO: 'Arraste para o quadro',

  // === Status de Arquivo ===
  STATUS_EXISTENTE: 'Arquivo encontrado',
  STATUS_DELETADO: 'Arquivo removido',
  STATUS_MOVIDO: 'Caminho quebrado',

  // === Diálogos ===
  DIALOGO_SELECIONAR_PASTA: 'Selecionar Pasta para Indexar',
  DIALOGO_REVINCULAR_ARQUIVO: 'Localizar Arquivo',
  DIALOGO_EXPORTAR_CORK: 'Exportar Quadro como .cork',
  DIALOGO_IMPORTAR_CORK: 'Importar Quadro .cork',
  DIALOGO_DESTINO_IMPORTACAO: 'Selecionar Pasta de Destino para Importação',

  // === Mensagens de Erro / Sucesso ===
  ERRO_CARREGAR_DADOS: 'Erro ao carregar dados. Iniciando com dados vazios.',
  ERRO_SALVAR_DADOS: 'Erro ao salvar dados.',
  ERRO_ABRIR_ARQUIVO: 'Não foi possível abrir o arquivo.',
  ERRO_ESCANEAR_PASTA: 'Erro ao escanear pasta.',
  SUCESSO_EXPORTADO: 'Quadro exportado com sucesso!',
  SUCESSO_IMPORTADO: 'Quadro importado com sucesso!',
  ERRO_EXPORTAR: 'Erro ao exportar quadro.',
  ERRO_IMPORTAR: 'Erro ao importar quadro.',

  // === Cores de Nota ===
  COR_AMARELO: 'Amarelo',
  COR_ROSA: 'Rosa',
  COR_AZUL: 'Azul',
  COR_VERDE: 'Verde',
  COR_LARANJA: 'Laranja',
  COR_ROXO: 'Roxo',
} as const
