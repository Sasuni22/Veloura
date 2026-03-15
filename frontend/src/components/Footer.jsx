import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <span className="font-display text-xl font-semibold text-white">ZaraStyle</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Redefining everyday elegance with style, refinement, and timeless design since 2019.
            </p>
            <div className="flex gap-4 mt-5">
              {['instagram', 'facebook', 'pinterest'].map((s) => (
                <button key={s} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-primary-dark transition-colors flex items-center justify-center">
                  <span className="text-xs text-gray-400">
                    {s === 'instagram' ? '📷' : s === 'facebook' ? '📘' : '📌'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shopping */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Shopping</h4>
            <ul className="space-y-2 text-sm">
              {['New Arrivals', 'Best Sellers', 'Sale Items', 'Gift Cards'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-2 text-sm">
              {['Shipping Policy', 'Returns & Exchanges', 'Size Guide', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive offers and style updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
              <button className="bg-primary-dark hover:bg-primary-darker text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2024 ZaraStyle. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
