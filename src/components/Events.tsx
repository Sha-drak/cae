import { motion } from 'framer-motion'
import '../styles/events.css'
import { fadeUp, fadeIn, scaleUp, staggerContainer, viewport } from '../hooks/useScrollAnimation'

type Event = {
  category: string
  title: string
  day: string
  time: string
  frequency: string
  description: string
  highlight?: boolean
}

const events: Event[] = [
  {
    category: 'Weekly',
    title: 'Sunday Worship Service',
    day: 'Every Sunday',
    time: '9:00 AM & 11:00 AM',
    frequency: 'Weekly',
    description: 'Our main gathering for worship, prayer, and the Word. All are welcome.',
    highlight: true,
  },
  {
    category: 'Weekly',
    title: 'Midweek Bible Study',
    day: 'Every Wednesday',
    time: '6:30 PM',
    frequency: 'Weekly',
    description: 'An in-depth study of Scripture in a warm, interactive setting.',
  },
  {
    category: 'Weekly',
    title: 'Corporate Prayer Meeting',
    day: 'Every Friday',
    time: '7:00 PM',
    frequency: 'Weekly',
    description: 'United prayer for the church, families, and the nation.',
  },
  {
    category: 'Special',
    title: 'Annual Convention',
    day: 'August 14–17, 2025',
    time: '5:00 PM daily',
    frequency: 'Annual',
    description: 'Our flagship annual gathering — powerful messages, worship, and fellowship.',
    highlight: true,
  },
  {
    category: 'Special',
    title: 'Revival Services',
    day: 'Last weekend of every month',
    time: '6:00 PM',
    frequency: 'Monthly',
    description: 'Special nights of revival, healing, and spiritual renewal.',
  },
  {
    category: 'Special',
    title: 'Youth Conference',
    day: 'September 20–21, 2025',
    time: '4:00 PM',
    frequency: 'Annual',
    description: 'A two-day gathering built to ignite the faith of young people.',
  },
]

function EventCard({ event }: { event: Event }) {
  return (
    <div className={`events__card ${event.highlight ? 'events__card--highlight' : ''}`}>
      <div className="events__card-header">
        <span className="events__card-frequency">{event.frequency}</span>
        {event.highlight && <span className="events__card-badge">Featured</span>}
      </div>
      <h3 className="events__card-title">{event.title}</h3>
      <div className="events__card-meta">
        <span className="events__card-day">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {event.day}
        </span>
        <span className="events__card-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {event.time}
        </span>
      </div>
      <p className="events__card-desc">{event.description}</p>
    </div>
  )
}

export default function Events() {
  const weekly = events.filter((e) => e.category === 'Weekly')
  const special = events.filter((e) => e.category === 'Special')

  return (
    <section className="section events" id="events">
      <div className="section__inner">

        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
        >
          <span className="section-eyebrow">What's On</span>
          <h2 className="section-title">Events &amp; Programs</h2>
          <p className="section-subtitle">
            There is always something happening at Christian Awareness Embassy.
            Come be a part of it.
          </p>
        </motion.div>

        <motion.div
          className="events__group-label"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeIn}
        >
          Regular Gatherings
        </motion.div>

        <motion.div
          className="events__grid"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={staggerContainer}
        >
          {weekly.map((e) => (
            <motion.div key={e.title} variants={scaleUp}>
              <EventCard event={e} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="events__group-label"
          style={{ marginTop: '3rem' }}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeIn}
        >
          Special Programs
        </motion.div>

        <motion.div
          className="events__grid"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={staggerContainer}
        >
          {special.map((e) => (
            <motion.div key={e.title} variants={scaleUp}>
              <EventCard event={e} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="events__footer"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
        >
          <p className="events__footer-text">
            Want to stay updated on all upcoming events?
          </p>
          <a
            href="https://wa.me/233000000000"
            target="_blank"
            rel="noreferrer"
            className="btn btn--outline-light"
          >
            Join our WhatsApp Group
          </a>
        </motion.div>

      </div>
    </section>
  )
}
