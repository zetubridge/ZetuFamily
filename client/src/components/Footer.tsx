import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold font-roboto">ZetuBridge</span>
            </div>
            <p className="text-gray-400">
              The leading platform for medical apps in Kenya, connecting students and professionals with essential educational tools.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Students</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Browse Apps</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Medical Education</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Study Resources</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">KMTC Apps</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Developers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/publish" className="hover:text-white transition-colors">Publish App</Link></li>
              <li><Link href="/developer/login" className="hover:text-white transition-colors">Developer Login</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ZetuBridge. All rights reserved. Empowering medical education in Kenya.</p>
        </div>
      </div>
    </footer>
  );
}
