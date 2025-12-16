import { Accordion } from 'flowbite'
import type { AccordionInterface, AccordionItem, AccordionOptions, InstanceOptions } from 'flowbite'

type DestroyFn = () => void

const ACCORDION_SELECTOR = '[data-accordion="collapse"]'
const TARGET_ATTR = 'data-accordion-target'

const getElement = (root: ParentNode, selector: string | null) => {
  if (!selector) return null
  const element = root.querySelector(selector)
  return element instanceof HTMLElement ? element : null
}

const buildItems = (accordionEl: HTMLElement): AccordionItem[] => {
  const items: AccordionItem[] = []
  const triggers = accordionEl.querySelectorAll<HTMLButtonElement>(`button[${TARGET_ATTR}]`)

  triggers.forEach((trigger) => {
    const targetSelector = trigger.getAttribute(TARGET_ATTR)
    const targetEl = getElement(accordionEl, targetSelector)
    if (!targetEl) return

    const headingId = trigger.closest<HTMLElement>('[id]')?.id
    const ariaControls = trigger.getAttribute('aria-controls') ?? ''
    const id = headingId ?? ariaControls ?? targetEl.id

    if (!id) return

    items.push({
      id,
      triggerEl: trigger,
      targetEl,
      active: trigger.getAttribute('aria-expanded') === 'true',
    })
  })

  return items
}

let accordionInstanceCounter = 0

const buildInstanceOptions = (accordionEl: HTMLElement): InstanceOptions => {
  const baseId = accordionEl.id || accordionEl.getAttribute('data-accordion-id')
  const instanceId = baseId || `accordion-${++accordionInstanceCounter}`
  return {
    id: instanceId,
    override: true,
  }
}

export default function initAccordion(targetAccordion?: HTMLElement): DestroyFn | undefined {
  const accordionEl = targetAccordion ?? document.querySelector<HTMLElement>(ACCORDION_SELECTOR)
  if (!accordionEl) return undefined

  const accordionItems = buildItems(accordionEl)
  if (!accordionItems.length) {
    return undefined
  }

  const options: AccordionOptions = {
    alwaysOpen: false,
    activeClasses: 'border-border',
    inactiveClasses: 'border-border',
  }

  const instanceOptions = buildInstanceOptions(accordionEl)

  const accordion: AccordionInterface = new Accordion(
    accordionEl,
    accordionItems,
    options,
    instanceOptions
  )

  return () => {
    accordion.destroy()
  }
}
