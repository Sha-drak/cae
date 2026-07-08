import { motion } from 'framer-motion'
import '../styles/contact.css'
import { fadeUp, scaleUp, slideRight, staggerContainer, viewport } from '../hooks/useScrollAnimation'

const infoCards = [
  {
    icon: '📍',
    label: 'Address',
    content: (
      <p className="contact__info-text">
        [Street Address]<br />[City, Region]<br />Ghana
      </p>
    ),
  },
  {
    icon: '📞',
    label: 'Phone',
    content: (
      <p className="contact__info-text">
        <a href="tel:+233000000000">+233 00 000 0000</a><br />
        <a href="tel:+233000000001">+233 00 000 0001</a>
      </p>
    ),
  },
  {
    icon: '✉️',
    label: 'Email',
    content: (
      <p className="contact__info-text">
        <a href="mailto:info@christianawarenessembassy.org">
          info@christianawarenessembassy.org
        </a>
      </p>
    ),
  },
  {
    icon: '🕊️',
    label: 'Service Times',
    content: (
      <p className="contact__info-text">
        Sunday: 9:00 AM &amp; 11:00 AM<br />
        Wednesday: 6:30 PM<br />
        Friday: 7:00 PM
      </p>
    ),
  },
]

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="section__inner">

        <motion.div
          className="section-header section-header--center"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
        >
          <span className="section-eyebrow">Get in Touch</span>
          <h2 className="section-title">We'd Love to Hear from You</h2>
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            Whether you have a question, need prayer, or want to visit — reach out.
            We are always happy to connect.
          </p>
        </motion.div>

        <div className="contact__layout">

          {/* Info cards */}
          <motion.div
            className="contact__info"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={staggerContainer}
          >
            {infoCards.map((card) => (
              <motion.div key={card.label} className="contact__info-card" variants={scaleUp}>
                <span className="contact__info-icon" aria-hidden="true">{card.icon}</span>
                <div>
                  <h3 className="contact__info-label">{card.label}</h3>
                  {card.content}
                </div>
              </motion.div>
            ))}

            <motion.a
              href="https://wa.me/233000000000"
              target="_blank"
              rel="noreferrer"
              className="contact__whatsapp"
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.486a.5.5 0 0 0 .612.612l5.65-1.48A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.504-5.231-1.383l-.374-.222-3.882 1.017 1.036-3.775-.244-.39A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Chat with us on WhatsApp
            </motion.a>
          </motion.div>

          {/* Map */}
          <motion.div
            className="contact__map-wrap"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={slideRight}
          >
            <iframe
              title="Church location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254508.11622637898!2d-0.30461309648580796!3d5.590957116498116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="contact__map-note">
              Update the map embed URL in <code>Contact.tsx</code> with your exact church location.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
