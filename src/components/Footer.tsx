import { motion } from 'framer-motion'
import '../styles/footer.css'
import { fadeUp, staggerContainer, viewport } from '../hooks/useScrollAnimation'

const quickLinks = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Sermons', href: '#sermons' },
  { label: 'Events', href: '#events' },
  { label: 'Ministries', href: '#ministries' },
  { label: 'Give', href: '#giving' },
  { label: 'Contact', href: '#contact' },
]

const serviceTimes = [
  { day: 'Sunday', time: '9:00 AM & 11:00 AM' },
  { day: 'Wednesday', time: '6:30 PM' },
  { day: 'Friday', time: '7:00 PM' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <motion.div
        className="footer__inner"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={staggerContainer}
      >
        <motion.div className="footer__brand" variants={fadeUp}>
          <a href="#" className="footer__logo">Christian Awareness Embassy</a>
          <p className="footer__tagline">
            Raising a generation of believers who know God, walk in His word,
            and impact their world for Christ.
          </p>
          <div className="footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
              </svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
              </svg>
            </a>
            <a href="https://wa.me/233536291063" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.486a.5.5 0 0 0 .612.612l5.65-1.48A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.504-5.231-1.383l-.374-.222-3.882 1.017 1.036-3.775-.244-.39A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </a>
          </div>
        </motion.div>

        <motion.div className="footer__col" variants={fadeUp}>
          <h4 className="footer__col-title">Quick Links</h4>
          <ul className="footer__links">
            {quickLinks.map((l) => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="footer__col" variants={fadeUp}>
          <h4 className="footer__col-title">Service Times</h4>
          <ul className="footer__times">
            {serviceTimes.map((s) => (
              <li key={s.day} className="footer__time-item">
                <span className="footer__time-day">{s.day}</span>
                <span className="footer__time-val">{s.time}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="footer__col" variants={fadeUp}>
          <h4 className="footer__col-title">Contact</h4>
          <address className="footer__address">
            <p>[Street Address]</p>
            <p>[City, Region], Ghana</p>
            <a href="tel:+233536291063">0536291063</a>
            <a href="mailto:info@christianawarenessembassy.org">
              info@christianawarenessembassy.org
            </a>
          </address>
        </motion.div>

      </motion.div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Christian Awareness Embassy. All rights reserved.</p>
        <p>Built with faith &amp; purpose.</p>
      </div>
    </footer>
  )
}
