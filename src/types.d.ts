declare global {
  interface Window {
    AlpineInstance?: any
  }
}

declare module '@alpinejs/collapse' {
  function collapse(): void
  export default collapse
}
