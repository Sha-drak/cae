import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import hero3 from '../media/hero/hero3.webp'
import hero4 from '../media/hero/hero4.jpeg'
import hero2 from '../media/hero/hero2.webp'
import '../styles/hero.css'

export type HeroSlide = {
  image: string
  title: string
  description: string
  primary: string
  secondary: string
}

const slides: HeroSlide[] = [
  {
    image: hero3,
    title: 'A Place to Belong',
    description: 'The church is a place where God\'s power transforms lives and brings hope, healing, and freedom. Come worship with us and experience the peace, purpose, and victory found in Christ.',
    primary: 'Visit Sunday',
    secondary: 'Watch Sermons',
  },
  {
    image: hero2,
    title: 'Growing in Faith Together',
    description: 'Join a vibrant community committed to spiritual growth, discipleship, and everyday impact.',
    primary: 'Explore Ministries',
    secondary: 'Learn more',
  },
  {
    image: hero4,
    title: 'Come As You Are',
    description: 'No matter your journey, you are welcome here. Discover purpose, hope, and a place to call home.',
    primary: 'Get Directions',
    secondary: 'Contact Us',
  },
]

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentIndex((value) => (value + 1) % slides.length)
    }, 7000)

    return () => window.clearInterval(interval)
  }, [])

  const currentSlide = slides[currentIndex]

  return (
    <section className="hero" aria-label="Church welcome hero">

      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide.image}
          className="hero__background"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 1.08,
            transition: { duration: 2.8, ease: [0.16, 1, 0.3, 1] },
          }}
          transition={{
            opacity: { duration: 2.8, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 2.2, ease: [0.16, 1, 0.3, 1] },
          }}
          style={{ backgroundImage: `url(${currentSlide.image})` }}
        />
      </AnimatePresence>

      <div className="hero__overlay" />

      <div className="hero__content">
        <div className="hero__content-grid">
          <div className="hero__headline">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentSlide.title}
            </motion.h1>
          </div>

          <div className="hero__panel">
            <motion.p
              className="hero__description"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentSlide.description}
            </motion.p>

            <motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <a href="#" className="hero__button hero__button--primary">
                {currentSlide.primary}
              </a>
              <a href="#" className="hero__button hero__button--secondary">
                {currentSlide.secondary}
              </a>
            </motion.div>
          </div>
        </div>
      </div>

    </section>
  )
}
