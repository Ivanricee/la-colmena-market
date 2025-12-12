import { InputCounter } from 'flowbite'
import type { InputCounterOptions, InputCounterInterface } from 'flowbite'
import type { InstanceOptions } from 'flowbite'

export function initInputNumber(root: Document | ParentNode = document) {
  const $targetEl = root.querySelector<HTMLInputElement>('[data-input-counter]')

  if (!$targetEl) {
    console.warn('InputCounter: target input not found')
    return
  }

  if (!$targetEl.id) {
    console.warn('InputCounter: target input requires an id')
    return
  }

  const $incrementEl = root.querySelector<HTMLElement>(
    `[data-input-counter-increment="${$targetEl.id}"]`
  )

  const $decrementEl = root.querySelector<HTMLElement>(
    `[data-input-counter-decrement="${$targetEl.id}"]`
  )

  // optional options with default values and callback functions
  const options: InputCounterOptions = {
    minValue: 0,
    maxValue: null, // infinite
    onIncrement: () => {
      console.log('input field value has been incremented')
    },
    onDecrement: () => {
      console.log('input field value has been decremented')
    },
  }

  // instance options object
  const instanceOptions: InstanceOptions = {
    id: 'counter-input-example',
    override: true,
  }

  /*
   * $targetEl: required
   * $incrementEl: optional
   * $decrementEl: optional
   * options: optional
   * instanceOptions: optional
   */
  const counterInput: InputCounterInterface = new InputCounter(
    $targetEl,
    $incrementEl,
    $decrementEl,
    options,
    instanceOptions
  )

  return counterInput
}
