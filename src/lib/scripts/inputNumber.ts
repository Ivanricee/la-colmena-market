export function initInputNumber(root: Document | ParentNode = document) {
  const doc = (root as Document).ownerDocument ?? (root as Document)
  const markerEl = doc.documentElement

  if (markerEl.dataset.inputNumberDelegated === 'true') {
    return
  }

  const emit = ($targetEl: HTMLInputElement, action: 'increment' | 'decrement' | 'input') => {
    $targetEl.dispatchEvent(
      new CustomEvent('input-number:change', {
        detail: {
          action,
          value: Number($targetEl.value),
          id: $targetEl.id,
          kind: $targetEl.dataset.inputNumberKind,
        },
        bubbles: true,
      })
    )
  }

  doc.addEventListener('click', (evt) => {
    const el = evt.target as Element | null
    if (!el) return

    const inc = el.closest<HTMLElement>('[data-input-counter-increment]')
    const dec = el.closest<HTMLElement>('[data-input-counter-decrement]')

    const inputId =
      inc?.getAttribute('data-input-counter-increment') ??
      dec?.getAttribute('data-input-counter-decrement')

    if (!inputId) return

    const $targetEl = doc.getElementById(inputId)
    if (!($targetEl instanceof HTMLInputElement)) return

    const action: 'increment' | 'decrement' = inc ? 'increment' : 'decrement'

    requestAnimationFrame(() => {
      emit($targetEl, action)
    })
  })

  doc.addEventListener('input', (evt) => {
    const el = evt.target as Element | null
    if (!(el instanceof HTMLInputElement)) return
    if (!el.matches('[data-input-counter]')) return
    emit(el, 'input')
  })

  markerEl.dataset.inputNumberDelegated = 'true'
  return
}
