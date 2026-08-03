import '../styles/services.css'
import hero1 from '../media/hero/hero1.webp'

const serviceTimes = [
  {
    day: 'Thursday',
    title: 'Prayer Meeting',
    time: '9:00 AM',
    note: 'Join us in prayer and intercession',
    icon: '🙏',
  },
  {
    day: 'Sunday',
    title: 'Sunday Worship Service',
    time: '9:00 AM',
    note: "Children's ministry available",
    icon: '🕊️',
  },
]

export default function Services() {
  return (
    <section className="section section--muted services" id="services">
      <div className="section__inner services__inner">

        <div className="services__content">
          <div className="section-header">
            <span className="section-eyebrow">Join Us</span>
            <h2 className="section-title">What's a Sunday like?</h2>
            <p className="section-subtitle">
              From the moment you walk in, expect a warm welcome, vibrant worship,
              and teaching rooted in the truth of God's word. Come as you are —
              there's a seat for you.
            </p>
          </div>

          <ul className="services__list" role="list">
            {serviceTimes.map((s) => (
              <li key={s.title} className="services__item">
                <span className="services__item-icon" aria-hidden="true">{s.icon}</span>
                <div className="services__item-body">
                  <span className="services__item-day">{s.day}</span>
                  <strong className="services__item-title">{s.title}</strong>
                  <span className="services__item-time">{s.time}</span>
                  <span className="services__item-note">{s.note}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="services__cta-row">
            <a href="#contact" className="btn btn--dark">Plan Your Visit</a>
            <a
              href="https://wa.me/233000000000"
              target="_blank"
              rel="noreferrer"
              className="btn btn--outline services__whatsapp-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.486a.5.5 0 0 0 .612.612l5.65-1.48A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.504-5.231-1.383l-.374-.222-3.882 1.017 1.036-3.775-.244-.39A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="services__image-wrap">
          <img src={hero1} alt="Congregation gathered for worship" className="services__image" />
          <div className="services__image-badge">
            <span className="services__badge-label">Every Sunday</span>
            <span className="services__badge-time">9 AM &amp; 11 AM</span>
          </div>
        </div>

      </div>
    </section>
  )
}
