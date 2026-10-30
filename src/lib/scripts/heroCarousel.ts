/* global window, document, setTimeout, clearTimeout, PointerEvent, FocusEvent, TouchEvent, Element, Node */
import type Alpine from 'alpinejs'

interface HeroCarouselData {
  current: number
  total: number
  touchX: number
  touchY: number
  interval: number
  playing: boolean
  hovering: boolean
  focusing: boolean
  timer: ReturnType<typeof setTimeout> | null
  readonly hasAutoplay: boolean
  readonly running: boolean
  readonly announcement: string
  init(): void
  destroy(): void
  schedule(): void
  tick(): void
  toggle(): void
  onPointerEnter(event: PointerEvent): void
  onPointerLeave(event: PointerEvent): void
  onFocusIn(event: FocusEvent): void
  onFocusOut(event: FocusEvent): void
  prev(): void
  next(): void
  goTo(index: number): void
  onTouchStart(event: TouchEvent): void
  onTouchEnd(event: TouchEvent): void
}

export default function heroCarousel(
  labels: string[] = [],
  { interval = 0 }: { interval?: number } = {}
): Alpine.AlpineComponent<HeroCarouselData> {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    current: 0,
    total: labels.length,
    touchX: 0,
    touchY: 0,

    // Autoplay
    interval,
    playing: interval > 0 && !reduceMotion,
    hovering: false, // pause
    focusing: false, // pause
    timer: null,

    get hasAutoplay() {
      return this.interval > 0 && this.total > 1
    },
    // true if playin
    get running() {
      return this.playing && !this.hovering && !this.focusing
    },
    get announcement() {
      return `${labels[this.current]}, ${this.current + 1} de ${this.total}`
    },

    init() {
      //reschedule timer when running changes
      this.$watch('running', () => this.schedule())
      this.schedule()
    },
    destroy() {
      if (this.timer !== null) clearTimeout(this.timer)
      this.timer = null
    },

    /* ---------- Autoplay ---------- */
    schedule() {
      this.destroy()
      if (!this.hasAutoplay || !this.running || document.hidden) return
      this.timer = setTimeout(() => this.tick(), this.interval)
    },
    tick() {
      this.next()
    },
    toggle() {
      this.playing = !this.playing
      // Si el usuario pide reanudar de forma explícita, anulamos las pausas temporales
      if (this.playing) {
        this.hovering = false
        this.focusing = false
      }
    },
    onPointerEnter(event) {
      if (event.pointerType === 'mouse') this.hovering = true
    },
    onPointerLeave(event) {
      if (event.pointerType === 'mouse') this.hovering = false
    },
    // Solo pausa si el foco viene del teclado (no al hacer click con mouse)
    onFocusIn(event) {
      if (event.target instanceof Element && event.target.matches(':focus-visible')) {
        this.focusing = true
      }
    },
    onFocusOut(event) {
      if (!(event.relatedTarget instanceof Node) || !this.$root.contains(event.relatedTarget)) {
        this.focusing = false
      }
    },

    /* ---------- Navegación ---------- */
    prev() {
      if (this.total < 2) return
      this.goTo(this.current === 0 ? this.total - 1 : this.current - 1)
    },
    next() {
      if (this.total < 2) return
      this.goTo(this.current === this.total - 1 ? 0 : this.current + 1)
    },

    goTo(index) {
      const target = Math.min(Math.max(index, 0), this.total - 1)
      if (target === this.current) return

      this.current = target
      this.schedule() // restart the timer
    },

    // Swipe en móvil
    onTouchStart(event) {
      const t = event.changedTouches.item(0)
      if (!t) return
      this.touchX = t.clientX
      this.touchY = t.clientY
    },
    onTouchEnd(event) {
      const t = event.changedTouches.item(0)
      if (!t) return
      const dx = t.clientX - this.touchX
      const dy = t.clientY - this.touchY
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) this.next()
      else this.prev()
    },
  }
}
