import type { Variants } from 'framer-motion'

// Shared ease curve matching the hero
const ease = [0.16, 1, 0.3, 1] as const

// Fade up — default for most elements
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.8, ease } },
}

// Fade in — for wider elements like section headers
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.9, ease } },
}

// Slide in from left
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.8, ease } },
}

// Slide in from right
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.8, ease } },
}

// Scale up — for cards, images
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.7, ease } },
}

// Stagger container — wraps a list of children that animate in sequence
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

// Viewport settings — trigger when 15% of element is visible, only once
export const viewport = { once: true, amount: 0.15 } as const
