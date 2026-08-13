"use client"

import { usePathname } from "next/navigation"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Scroll-reveal groups: each selector's matching elements animate in with a
// staggered fade + rise when the group enters the viewport. Tuned for a
// cinematic, high-end narrative feel (longer durations, expo/power4 easing,
// larger travel distance) per the ui-ux-pro-max motion presets.
type RevealSpec = {
  sel: string
  y?: number
  stagger?: number
  start?: string
  duration?: number
  ease?: string
}

const REVEALS: RevealSpec[] = [
  { sel: ".application-card", y: 64, stagger: 0.12, start: "top 86%", duration: 1.1, ease: "power4.out" },
  { sel: ".catalog-card", y: 64, stagger: 0.12, start: "top 86%", duration: 1.1, ease: "power4.out" },
  { sel: ".capability-card", y: 70, stagger: 0.14, start: "top 82%", duration: 1.2, ease: "power4.out" },
  { sel: ".process-list li", y: 36, stagger: 0.1, start: "top 88%", duration: 0.9, ease: "power3.out" },
  { sel: ".story-visual, .detail-patch, .color-disc", y: 54, stagger: 0.06, start: "top 84%", duration: 1.1, ease: "power3.out" },
  { sel: "[data-reveal]", y: 48, stagger: 0, start: "top 85%", duration: 1.0, ease: "expo.out" },
]

// Scrubbed parallax layers. Amplitudes raised vs. the previous pass so the
// depth separation reads clearly. scrub: 1 adds a smooth catch-up lag.
type ParallaxSpec = { sel: string; yPercent?: number; xPercent?: number }

const PARALLAXES: ParallaxSpec[] = [
  { sel: ".hero__visual", yPercent: 16 },
  { sel: ".hero__field", yPercent: 42, xPercent: -6 },
  { sel: ".hero__note", yPercent: 30 },
  { sel: ".story-visual", yPercent: 12 },
  { sel: ".detail-patch", yPercent: -14 },
]

export function MotionLayer() {
  const pathname = usePathname()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Only run when the user has not requested reduced motion.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── Cinematic hero open (plays on load, no scroll trigger) ──────────
        const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } })
        heroTl
          .from(".eyebrow", { autoAlpha: 0, y: 40, duration: 1.1 }, 0.1)
          .from(".hero__description", { autoAlpha: 0, y: 44, duration: 1.1 }, 0.22)
          .from(".hero__actions", { autoAlpha: 0, y: 40, duration: 1.0 }, 0.34)
          .from(".hero__visual", { autoAlpha: 0, scale: 1.06, y: 50, duration: 1.5 }, 0.1)
          .from(".hero__field", { autoAlpha: 0, yPercent: 18, duration: 1.7 }, 0.25)
          .from(".patch-object", { autoAlpha: 0, rotate: -18, scale: 0.9, duration: 1.3 }, 0.5)
          .from(".hero__note", { autoAlpha: 0, y: 30, duration: 1.0 }, 0.7)

        // ── Cinematic mask reveal for headings (clip-path wipe + rise) ──────
        gsap.utils.toArray<HTMLElement>(".hero h1, .section-heading h2").forEach((el) => {
          gsap.from(el, {
            clipPath: "inset(0 0 100% 0)",
            yPercent: 16,
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          })
        })

        // ── Staggered content/card reveals ──────────────────────────────────
        for (const spec of REVEALS) {
          const els = gsap.utils.toArray<HTMLElement>(spec.sel)
          if (!els.length) continue
          gsap.from(els, {
            autoAlpha: 0,
            y: spec.y ?? 40,
            duration: spec.duration ?? 0.9,
            ease: spec.ease ?? "power3.out",
            stagger: spec.stagger ?? 0,
            scrollTrigger: {
              trigger: els[0],
              start: spec.start ?? "top 85%",
              once: true,
            },
          })
        }

        // ── Scrubbed parallax depth ─────────────────────────────────────────
        for (const spec of PARALLAXES) {
          gsap.utils.toArray<HTMLElement>(spec.sel).forEach((el) => {
            gsap.to(el, {
              yPercent: spec.yPercent ?? 0,
              xPercent: spec.xPercent ?? 0,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
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
