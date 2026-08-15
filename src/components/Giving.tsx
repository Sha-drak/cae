import { motion } from 'framer-motion'
import '../styles/giving.css'
import { fadeUp, scaleUp, staggerContainer, viewport } from '../hooks/useScrollAnimation'

const mobileMoney = [
  { network: 'MTN Mobile Money', number: '0559195400', name: 'Ofosu Sampson' },
]

const bankDetails = {
  bankName: 'Fidelity',
  accountName: 'Ofosu Sampson',
  accountNumber: '2030416065815',
  branch: 'Nkawkaw',
}

export default function Giving() {
  return (
    <section className="section section--soft giving" id="giving">
      <div className="section__inner">
        <div className="giving__layout">

          {/* Left: message */}
          <motion.div
            className="giving__message"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={staggerContainer}
          >
            <motion.span className="section-eyebrow" variants={fadeUp}>Support the Work</motion.span>
            <motion.h2 className="section-title" variants={fadeUp}>
              Give &amp; Make<br />an Impact
            </motion.h2>
            <motion.p className="giving__text" variants={fadeUp}>
              Your giving supports the work of God in our church and community.
              Every gift — big or small — goes toward worship, outreach,
              discipleship, and caring for people in need.
            </motion.p>
            <motion.p className="giving__text" variants={fadeUp}>
              We believe in cheerful, generous giving as an act of worship.
              Thank you for partnering with us.
            </motion.p>
            <motion.blockquote className="giving__verse" variants={fadeUp}>
              "Each of you should give what you have decided in your heart to give,
              not reluctantly or under compulsion, for God loves a cheerful giver."
              <cite>— 2 Corinthians 9:7</cite>
            </motion.blockquote>
          </motion.div>

          {/* Right: giving methods */}
          <motion.div
            className="giving__methods"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={staggerContainer}
          >
            {/* Mobile Money */}
            <motion.div className="giving__block" variants={scaleUp}>
              <div className="giving__block-header">
                <span className="giving__block-icon" aria-hidden="true">📱</span>
                <h3 className="giving__block-title">Mobile Money</h3>
              </div>
              <ul className="giving__momo-list" role="list">
                {mobileMoney.map((m) => (
                  <li key={m.network} className="giving__momo-item">
                    <div className="giving__momo-network">{m.network}</div>
                    <div className="giving__momo-number">{m.number}</div>
                    <div className="giving__momo-name">{m.name}</div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Bank */}
            <motion.div className="giving__block" variants={scaleUp}>
              <div className="giving__block-header">
                <span className="giving__block-icon" aria-hidden="true">🏦</span>
                <h3 className="giving__block-title">Bank Transfer</h3>
              </div>
              <dl className="giving__bank-details">
                <div className="giving__bank-row"><dt>Bank</dt><dd>{bankDetails.bankName}</dd></div>
                <div className="giving__bank-row"><dt>Account Name</dt><dd>{bankDetails.accountName}</dd></div>
                <div className="giving__bank-row"><dt>Account No.</dt><dd className="giving__bank-number">{bankDetails.accountNumber}</dd></div>
                <div className="giving__bank-row"><dt>Branch</dt><dd>{bankDetails.branch}</dd></div>
              </dl>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
