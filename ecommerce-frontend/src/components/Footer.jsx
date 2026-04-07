export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111111' }} className="mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Portfolio Section */}
        <div className="mb-6 pb-6 border-b" style={{ borderColor: '#333333' }}>
          <div className="bg-white rounded-lg p-4" style={{ borderLeftColor: '#111111', borderLeftWidth: '4px' }}>
            <h3 className="text-base font-bold mb-2" style={{ color: '#111111' }}>PORTFOLIO PROJECT - FULL STACK E-COMMERCE</h3>
            <p className="mb-2 text-sm" style={{ color: '#111111' }}>
              <span className="font-semibold" style={{ color: '#111111' }}>Tech Stack:</span> React.js • Node.js • Express.js • MongoDB • Tailwind CSS • Axios • JWT Authentication
            </p>
            <p className="mb-2 text-sm" style={{ color: '#111111' }}>
              <span className="font-semibold" style={{ color: '#111111' }}>Features:</span> User Authentication • Product Management • Shopping Cart • Order Tracking • Admin Dashboard • Secure Storage
            </p>
            <p className="text-sm" style={{ color: '#111111' }}>
              <span className="font-semibold" style={{ color: '#111111' }}>Interested in building a similar project?</span> Contact me at 
              <a href="mailto:ronarosales17@gmail.com" className="font-bold hover:opacity-80 ml-2" style={{ color: '#111111' }}>ronarosales17@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-bold mb-2 text-white text-sm">About</h3>
            <p className="text-white text-xs">Your trusted online shopping destination.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-white text-sm">Support</h3>
            <ul className="text-white space-y-1 text-xs">
              <li><a href="#" className="hover:opacity-80">Contact Us</a></li>
              <li><a href="#" className="hover:opacity-80">FAQ</a></li>
              <li><a href="#" className="hover:opacity-80">Shipping</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-white text-sm">Legal</h3>
            <ul className="text-white space-y-1 text-xs">
              <li><a href="#" className="hover:opacity-80">Privacy</a></li>
              <li><a href="#" className="hover:opacity-80">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-4 text-center text-white text-xs" style={{ borderColor: '#333333' }}>
          <p>&copy; 2024 ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
