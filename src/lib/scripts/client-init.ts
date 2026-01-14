import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'

export default function initClientUI(): void {
  if (!window.AlpineInstance) {
    Alpine.plugin(collapse)
    window.AlpineInstance = Alpine
  }
}
