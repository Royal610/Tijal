import { Link } from 'react-router-dom';
import { Printer, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [phoneNumber, setPhoneNumber] = useState("919203700114");

  useEffect(() => {
    fetch('/api/settings/contact')
      .then(res => res.json())
      .then(data => {
        if (data.whatsapp) setPhoneNumber(data.whatsapp);
      })
      .catch(console.error);
  }, []);

  const formatDisplayPhone = (num: string) => {
    if (num.startsWith('91') && num.length === 12) {
      return `+91 ${num.substring(2, 7)} ${num.substring(7)}`;
    }
    return num;
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Viyomkesh Art Vision Logo" className="h-16 w-auto bg-white p-2 rounded-lg" />
            </Link>
            <p className="text-sm text-slate-400">
              Your trusted partner for all professional printing needs. High quality, fast turnaround, and excellent customer service.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/testimonials" className="hover:text-white transition-colors">Testimonials</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Our Products</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="hover:text-white transition-colors">ID Cards & Keyrings</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Visiting Cards</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Digital Printing</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Banners & Flex</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Custom Gifts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span>H. No. 176 Near Panchayat Bhawan Najarpur Jamai Chhindwara 480551</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>{formatDisplayPhone(phoneNumber)}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>Viyomkeshartvision@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div className="flex flex-col items-center md:items-start space-y-1 mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Viyomkesh Art Vision. All rights reserved.</p>
            <p>Developed by <a href="https://www.royalzinformatics.com" target="_blank" rel="noopener noreferrer" className="text-[#F27C21] hover:text-[#d66b1c] hover:underline transition-colors font-medium">www.royalzinformatics.com</a></p>
          </div>
          <div className="space-x-4">
            <Link to="/admin" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
