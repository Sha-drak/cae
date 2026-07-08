import { motion } from 'framer-motion'
import '../styles/about.css'
import hero3 from '../media/hero/hero3.webp'
import { fadeUp, fadeIn, slideLeft, slideRight, scaleUp, staggerContainer, viewport } from '../hooks/useScrollAnimation'

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="section__inner about__inner">

        {/* ── Top: Intro + Mission split ── */}
        <div className="about__top">

          {/* Left — intro text */}
          <motion.div
            className="about__intro"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={slideLeft}
          >
            <span className="section-eyebrow">Welcome</span>
            <h2 className="section-title">
              A community built<br />on faith &amp; love.
            </h2>
            <p className="section-subtitle">
              Christian Awareness Embassy is more than a church — it is a family.
              We gather every week to worship, to grow, and to serve one another
              and our community. Whoever you are, wherever you come from, you
              are welcome here.
            </p>
            <div className="about__cta-row">
              <a href="#contact" className="btn btn--dark">Plan a Visit</a>
              <a href="#services" className="btn btn--glass">Service Times</a>
            </div>
          </motion.div>

          {/* Right — mission cards staggered */}
          <motion.div
            className="about__mission-block"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={staggerContainer}
          >
            {[
              {
                label: 'Our Mission',
                text: 'To raise a generation of believers who know God, walk in His word, and impact their world for Christ.',
              },
              {
                label: 'Our Vision',
                text: 'A church where every person discovers purpose, experiences transformation, and belongs to a thriving community of faith.',
              },
            ].map((item) => (
              <motion.div key={item.label} className="about__mission-card" variants={fadeUp}>
                <span className="about__mission-label">{item.label}</span>
                <p className="about__mission-text">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Pastor message ── */}
        <div className="about__pastor">
          <motion.div
            className="about__pastor-img-wrap"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={scaleUp}
          >
            <img src={hero3} alt="Pastor giving welcome message" className="about__pastor-img" />
          </motion.div>

          <motion.div
            className="about__pastor-content"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={staggerContainer}
          >
            <motion.span className="section-eyebrow" variants={fadeUp}>
              A word from our pastor
            </motion.span>
            <motion.blockquote className="about__pastor-quote" variants={fadeUp}>
              "We believe that church should feel like home — a place where you
              are truly known, genuinely loved, and consistently challenged to
              become everything God created you to be. Come as you are. Stay
              and grow."
            </motion.blockquote>
            <motion.p className="about__pastor-name" variants={fadeUp}>
              — Pastor [Name], Lead Pastor
            </motion.p>
            <motion.div variants={fadeUp}>
              <a href="#contact" className="btn btn--glass about__pastor-btn">
                Connect with us
              </a>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
