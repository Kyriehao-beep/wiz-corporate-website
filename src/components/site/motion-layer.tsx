"use client"

import { usePathname } from "next/navigation"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Scroll-reveal groups: each selector's matching elements animate in with a
// staggered fade + rise when the first one enters the viewport.
type RevealSpec = {
  sel: string
  y?: number
  stagger?: number
  start?: string
  duration?: number
}

const REVEALS: RevealSpec[] = [
  { sel: ".hero__copy > *", y: 32, stagger: 0.12, start: "top 95%", duration: 1 },
  { sel: ".section-heading", y: 44, stagger: 0, start: "top 82%" },
  { sel: ".application-card", y: 52, stagger: 0.1, start: "top 88%" },
  { sel: ".catalog-card", y: 52, stagger: 0.1, start: "top 88%" },
  { sel: ".capability-card", y: 60, stagger: 0.12, start: "top 84%" },
  { sel: ".process-list li", y: 30, stagger: 0.08, start: "top 90%" },
  { sel: ".story-visual, .detail-patch, .color-disc", y: 48, stagger: 0.06, start: "top 86%" },
  { sel: "[data-reveal]", y: 40, stagger: 0, start: "top 85%" },
]

// Scrubbed parallax layers: move on scroll for depth.
type ParallaxSpec = { sel: string; speed: number }

const PARALLAXES: ParallaxSpec[] = [
  { sel: ".hero__visual", speed: 0.12 },
  { sel: ".hero__field", speed: 0.22 },
]

export function MotionLayer() {
  const pathname = usePathname()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Only run when the user has not requested reduced motion.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        for (const spec of REVEALS) {
          const els = gsap.utils.toArray<HTMLElement>(spec.sel)
          if (!els.length) continue
          gsap.from(els, {
            autoAlpha: 0,
            y: spec.y ?? 40,
            duration: spec.duration ?? 0.9,
            ease: "power3.out",
            stagger: spec.stagger ?? 0,
            scrollTrigger: {
              trigger: els[0],
              start: spec.start ?? "top 85%",
              once: true,
            },
          })
        }

        for (const spec of PARALLAXES) {
          gsap.utils.toArray<HTMLElement>(spec.sel).forEach((el) => {
            gsap.to(el, {
              yPercent: spec.speed * 100,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            })
          })
        }

        ScrollTrigger.refresh()
      })
    },
    { dependencies: [pathname] },
  )

  return null
}
