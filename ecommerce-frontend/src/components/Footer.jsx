export default function Footer() {
  return (
    <footer className="text-white mt-12" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Portfolio Section */}
        <div className="mb-8 pb-8 border-b" style={{ borderColor: '#333333' }}>
          <div className="bg-white rounded-lg p-6" style={{ borderLeftColor: '#111111', borderLeftWidth: '4px' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#111111' }}>PORTFOLIO PROJECT - FULL STACK E-COMMERCE</h3>
            <p className="mb-3" style={{ color: '#333333' }}>
              <span className="font-semibold">Tech Stack:</span> React.js • Node.js • Express.js • MongoDB • Tailwind CSS • Axios • JWT Authentication
            </p>
            <p className="mb-3" style={{ color: '#333333' }}>
              <span className="font-semibold">Features:</span> User Authentication • Product Management • Shopping Cart • Order Tracking • Admin Dashboard • Secure Storage
            </p>
            <p style={{ color: '#111111' }}>
              <span className="font-semibold">Interested in building a similar project?</span> Contact me at 
              <a href="mailto:ronarosales17@gmail.com" className="font-bold hover:opacity-80 ml-2" style={{ color: '#111111' }}>ronarosales17@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4 text-white">About</h3>
            <p className="text-white text-sm">Your trusted online shopping destination.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Support</h3>
            <ul className="text-white space-y-2 text-sm">
              <li><a href="#" className="hover:opacity-80">Contact Us</a></li>
              <li><a href="#" className="hover:opacity-80">FAQ</a></li>
              <li><a href="#" className="hover:opacity-80">Shipping</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Legal</h3>
            <ul className="text-white space-y-2 text-sm">
              <li><a href="#" className="hover:opacity-80">Privacy</a></li>
              <li><a href="#" className="hover:opacity-80">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-white" style={{ borderColor: '#333333' }}>
          <p>&copy; 2024 ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
