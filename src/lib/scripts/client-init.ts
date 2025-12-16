import initAccordion from './accordion'
import toggleDarkMode from './toggle-darkmode'

type DestroyFn = () => void

const ACCORDION_SELECTOR = '[data-accordion="collapse"]'

let accordionDestroyFns: DestroyFn[] = []

const destroyAllAccordions = () => {
  accordionDestroyFns.forEach((destroy) => destroy())
  accordionDestroyFns = []
}

const setupAllAccordions = () => {
  destroyAllAccordions()
  document.querySelectorAll<HTMLElement>(ACCORDION_SELECTOR).forEach((accordionEl) => {
    const destroy = initAccordion(accordionEl)
    if (destroy) accordionDestroyFns.push(destroy)
  })
}

export default function initClientUI(): void {
  const setup = () => {
    toggleDarkMode()
    setupAllAccordions()
  }

  setup()

  document.addEventListener('astro:before-swap', () => {
    destroyAllAccordions()
  })

  document.addEventListener('astro:page-load', () => {
    setup()
  })
}
