import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import About from '../components/About'
import Sermons from '../components/Sermons'
import Events from '../components/Events'
import Ministries from '../components/Ministries'
import Giving from '../components/Giving'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import InstallToast from '../components/InstallToast'

export default function HomePage() {
  return (
    <div className="hero-shell">
      <Navbar />
      <Hero />
      <About />
      <Sermons />
      <Events />
      <Ministries />
      <Giving />
      <Contact />
      <Footer />
      <InstallToast />
    </div>
  )
}
