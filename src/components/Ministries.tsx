import { motion } from 'framer-motion'
import '../styles/ministries.css'
import { fadeUp, scaleUp, staggerContainer, viewport } from '../hooks/useScrollAnimation'

const ministries = [
  {
    title: 'Youth Ministry',
    tagline: 'Raising the next generation',
    description: 'A vibrant space where young people encounter God, build friendships, and discover their God-given purpose. We meet weekly with energy, worship, and real talk.',
    cta: 'Join Youth',
  },
  {
    title: "Women's Ministry",
    tagline: 'Women of strength & grace',
    description: 'A sisterhood of faith — supporting, encouraging, and equipping women to thrive spiritually, in the home, and in the marketplace.',
    cta: 'Join Women',
  },
  {
    title: "Men's Ministry",
    tagline: 'Men of God, built for purpose',
    description: 'A brotherhood that holds each other accountable, sharpens character, and stands firm in faith, family, and community leadership.',
    cta: 'Join Men',
  },
  {
    title: "Children's Ministry",
    tagline: 'Nurturing young hearts',
    description: 'A safe, fun, and faith-filled environment for children to learn about God through age-appropriate teaching, games, and creative activities.',
    cta: 'Learn More',
  },
  {
    title: 'Choir & Music Ministry',
    tagline: 'Worship that moves heaven',
    description: 'Our music ministry leads the church in powerful, spirit-filled worship every Sunday. If you have a gift for music or singing, we want to hear from you.',
    cta: 'Join Choir',
  },
  {
    title: 'Ushering & Protocol',
    tagline: 'Excellence in service',
    description: 'Our usher team ensures every person who walks through our doors is welcomed with warmth, dignity, and a sense of belonging.',
    cta: 'Serve with Us',
  },
]

export default function Ministries() {
  return (
    <section className="section section--dark ministries" id="ministries">
      <div className="section__inner">

        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
        >
          <span className="section-eyebrow">Community</span>
          <h2 className="section-title">Find Where You Belong</h2>
          <p className="section-subtitle">
            Christian Awareness Embassy is made up of people from every walk of
            life. Whatever your age or season, there is a ministry for you.
          </p>
        </motion.div>

        <motion.div
          className="ministries__grid"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={staggerContainer}
        >
          {ministries.map((m) => (
            <motion.div key={m.title} className="ministries__card" variants={scaleUp}>
              <div className="ministries__card-body">
                <span className="ministries__card-tagline">{m.tagline}</span>
                <h3 className="ministries__card-title">{m.title}</h3>
                <p className="ministries__card-desc">{m.description}</p>
                <a href="#contact" className="ministries__card-cta">
                  {m.cta} →
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
