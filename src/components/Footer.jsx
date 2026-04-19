import { Link } from 'react-router-dom';
import { Globe, Share2, Play, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#f8f6f3', borderTop: '1px solid var(--border)' }}>
      {/* Newsletter */}
      <div style={{ background: '#1c1c1c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Stay in the loop
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              New drops, exclusive offers, and style guides.
            </p>
          </div>
          <form className="flex gap-3 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="flex-1 md:w-64 relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full h-11 pl-9 pr-4 text-sm"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  outline: 'none',
                }}
              />
            </div>
            <button type="submit" className="btn-accent whitespace-nowrap px-5">
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/">
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1c1c1c',
                }}
              >
                LUXE
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed mt-4 mb-6 max-w-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              Curating the finest contemporary fashion for the modern wardrobe. Quality without compromise.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Share2, Play].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 flex items-center justify-center transition-all hover:bg-black hover:text-white"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Shop', links: ['New Arrivals', "Men's", "Women's", 'Accessories', 'Sale'] },
            { title: 'Help', links: ['FAQ', 'Shipping', 'Returns', 'Size Guide', 'Contact'] },
            { title: 'Company', links: ['About', 'Careers', 'Press', 'Sustainability'] },
          ].map((col) => (
            <div key={col.title}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      to="/shop"
                      className="text-sm transition-colors hover:text-black"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 LUXE. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <a key={l} href="#" className="text-xs transition-colors hover:text-black" style={{ color: 'var(--text-muted)' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
