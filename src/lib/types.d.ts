import Alpine from 'alpinejs'

declare global {
  interface Window {
    AlpineInstance?: Alpine
  }
}

declare module '@alpinejs/collapse' {
  function collapse(): void
  export default collapse
}
