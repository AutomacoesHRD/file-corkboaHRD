/**
 * Declaração de tipo global para CSS Modules.
 * Permite importar arquivos .module.css sem erros de TypeScript.
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}
