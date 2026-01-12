
import { initInputNumber } from './inputNumber'

export default function initClientUI(): void {
  const setup = () => {
    
    initInputNumber()
  }

  // Avoid running setup twice on the initial load because `astro:page-load`
  // is also fired on first load when using View Transitions.
  let lastUrl = window.location.href
  setup()

  document.addEventListener('astro:page-load', () => {
    if (window.location.href === lastUrl) return
    lastUrl = window.location.href
    setup()
  })
}
