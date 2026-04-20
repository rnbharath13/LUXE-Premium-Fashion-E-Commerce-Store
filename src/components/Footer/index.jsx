import { Link } from 'react-router-dom';
import { Globe, Share2, Play, Mail, ArrowRight } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <div>
            <h3 className="footer-newsletter-title">Stay in the loop</h3>
            <p className="footer-newsletter-desc">New drops, exclusive offers, and style guides.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="footer-newsletter-input-wrap">
              <Mail size={14} className="footer-newsletter-input-icon" />
              <input type="email" placeholder="your@email.com" className="footer-newsletter-input" />
            </div>
            <button type="submit" className="btn-accent" style={{ whiteSpace: 'nowrap', padding: '0 1.25rem' }}>
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="footer-main">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/"><span className="footer-brand-logo">LUXE</span></Link>
            <p className="footer-brand-desc">
              Curating the finest contemporary fashion for the modern wardrobe. Quality without compromise.
            </p>
            <div className="footer-social-row">
              {[Globe, Share2, Play].map((Icon, i) => (
                <button key={i} className="footer-social-btn"><Icon size={15} /></button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: 'Shop',    links: ['New Arrivals', "Men's", "Women's", 'Accessories', 'Sale'] },
            { title: 'Help',    links: ['FAQ', 'Shipping', 'Returns', 'Size Guide', 'Contact'] },
            { title: 'Company', links: ['About', 'Careers', 'Press', 'Sustainability'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="footer-col-title">{col.title}</h4>
              <ul className="footer-col-list">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link to="/shop" className="footer-col-link">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 LUXE. All rights reserved.</p>
          <div className="footer-legal">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <a key={l} href="#" className="footer-legal-link">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
