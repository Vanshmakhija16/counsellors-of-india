'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

export interface LiquidInkCursorProps {
  /** Base hue of the ink in rgb (no alpha). Defaults to near-black. */
  color?: string
  /** Maximum radius of a freshly spawned particle, in CSS pixels. */
  size?: number
  /** Easing factor for the smoothed pointer (0..1, higher = snappier). */
  ease?: number
  /** How quickly a particle dissolves. Higher = shorter trail. */
  decay?: number
  /** Final CSS blur applied to the whole canvas (px). */
  blur?: number
  /** Maximum live particles. Older ones are recycled. */
  maxParticles?: number
}

const DEFAULTS: Required<LiquidInkCursorProps> = {


  color: '52, 72, 64',

  // slightly larger = softer luxury feel
  size: 14,

  // smoother trailing motion
  ease: 0.11,

  // slower fade for ink effect
  decay: 0.012,

  // softer edges
  blur: 14,

  // less clutter, more elegance
  maxParticles: 42,
}
export default function LiquidInkCursor(props: LiquidInkCursorProps) {
  const opts = { ...DEFAULTS, ...props }
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduceMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    let pointerX = -1000
    let pointerY = -1000
    let smoothX = pointerX
    let smoothY = pointerY
    let prevSmoothX = smoothX
    let prevSmoothY = smoothY
    let entered = false

    const particles: Particle[] = []
    const pool: Particle[] = []

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      const p: Particle = pool.pop() ?? {
        x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0,
      }
      p.x = x
      p.y = y
      // tiny random drift so the trail breathes
      p.vx = vx * 0.35 + (Math.random() - 0.5) * 0.4
      p.vy = vy * 0.35 + (Math.random() - 0.5) * 0.4
      p.life = 1
      p.maxLife = 1
      p.size = opts.size * (0.7 + Math.random() * 0.45)
      particles.push(p)
      if (particles.length > opts.maxParticles) {
        const old = particles.shift()
        if (old) pool.push(old)
      }
    }

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX
      pointerY = e.clientY
      if (!entered) {
        smoothX = pointerX
        smoothY = pointerY
        prevSmoothX = smoothX
        prevSmoothY = smoothY
        entered = true
      }
    }
    const onLeave = () => {
      entered = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', resize)

    let rafId = 0
    let running = true
    const onVisibility = () => {
      if (document.hidden) {
        running = false
      } else if (!running) {
        running = true
        prevSmoothX = smoothX
        prevSmoothY = smoothY
        last = performance.now()
        rafId = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    let last = performance.now()

    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min(48, now - last) / 16.67 // frames at 60fps
      last = now

      // Critically-damped follow toward the raw pointer.
      smoothX += (pointerX - smoothX) * opts.ease * dt
      smoothY += (pointerY - smoothY) * opts.ease * dt

      const vx = smoothX - prevSmoothX
      const vy = smoothY - prevSmoothY
      prevSmoothX = smoothX
      prevSmoothY = smoothY

      const speed = Math.hypot(vx, vy)

      if (entered && speed > 0.1) {
        // Emit more particles when moving fast → continuous ribbon.
        const emit = Math.min(4, 1 + Math.floor(speed / 14))
        for (let i = 0; i < emit; i++) {
          // Distribute along the segment for smoother trails on fast moves.
          const t = (i + 1) / (emit + 1)
          spawn(
            prevSmoothX + vx * t,
            prevSmoothY + vy * t,
            vx,
            vy,
          )
        }
      }

      // Fade canvas slightly each frame for a residual smoke wash.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = `rgba(0, 0, 0, ${0.08 * dt})`
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = 'source-over'

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= opts.decay * dt
        if (p.life <= 0) {
          particles.splice(i, 1)
          pool.push(p)
          continue
        }

        // Inertia + slight upward drift like rising ink in water.
        p.x += p.vx * dt
        p.y += p.vy * dt - 0.15 * dt
        p.vx *= 0.92
        p.vy *= 0.92

        const t = p.life / p.maxLife
        const radius = p.size * (0.4 + t * 0.9)
        const alpha = Math.pow(t, 1.4) * 0.55

        // Velocity-based stretching: scale along motion direction.
        const localSpeed = Math.hypot(p.vx, p.vy)
        const stretch = Math.min(2.4, 1 + localSpeed * 0.14)
        const angle = Math.atan2(p.vy, p.vx)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(angle)
        ctx.scale(stretch, 1 / Math.sqrt(stretch))

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        gradient.addColorStop(0, `rgba(${opts.color}, ${alpha})`)
        gradient.addColorStop(0.55, `rgba(${opts.color}, ${alpha * 0.35})`)
        gradient.addColorStop(1, `rgba(${opts.color}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Crisp center dot — the "pen tip" anchoring the ink.
      if (entered) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(${opts.color}, 0.85)`
        ctx.arc(smoothX, smoothY, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [opts.color, opts.size, opts.ease, opts.decay, opts.blur, opts.maxParticles])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        filter: `blur(${opts.blur}px) contrast(1.05)`,
        mixBlendMode: 'multiply',
      }}
    />
  )
}
