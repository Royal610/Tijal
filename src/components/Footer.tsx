import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Send } from 'lucide-react';

export default function Footer() {
  const [phoneNumber] = useState("919203700114");
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    facebook_url: '#',
    instagram_url: '#',
    twitter_url: '#'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.facebook_url) {
          setSettings(data);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Thank you for subscribing!' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Subscription failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    }
  };

  const formatDisplayPhone = (num: string) => {
    if (num.startsWith('91') && num.length === 12) {
      return `+91 ${num.substring(2, 7)} ${num.substring(7)}`;
    }
    return num;
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[140px] -mr-64 -mt-64" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-[60px] text-center md:text-left">
          <div className="space-y-8 flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Viyomkesh Art Vision Logo" className="h-14 w-auto bg-white p-2 rounded-2xl" />
              <div>
                <span className="block text-xl font-display font-black leading-none text-white">Viyomkesh</span>
                <span className="block text-[10px] tracking-[0.2em] uppercase font-bold text-brand-primary">Art Vision</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Transforming your ideas into tangible reality with precision printing and innovative art solutions.
            </p>
            <div className="flex space-x-4">
              <a href={settings.facebook_url || '#'} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all transform hover:-translate-y-1">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={settings.twitter_url || '#'} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all transform hover:-translate-y-1">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={settings.instagram_url || '#'} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all transform hover:-translate-y-1">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-display font-bold text-lg mb-8 uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-primary transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-brand-primary transition-colors">Products</Link></li>
              <li><Link to="/testimonials" className="hover:text-brand-primary transition-colors">Testimonials</Link></li>
              <li><Link to="/contact" className="hover:text-brand-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-display font-bold text-lg mb-8 uppercase tracking-widest">Our Catalog</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/services" className="hover:text-brand-primary transition-colors">Corporate ID Cards</Link></li>
              <li><Link to="/services" className="hover:text-brand-primary transition-colors">Premium Visiting Cards</Link></li>
              <li><Link to="/services" className="hover:text-brand-primary transition-colors">High-End Digital Printing</Link></li>
              <li><Link to="/services" className="hover:text-brand-primary transition-colors">Outdoor Banner & Flex</Link></li>
              <li><Link to="/services" className="hover:text-brand-primary transition-colors">Personalized Branding Gifts</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-display font-bold text-lg mb-8 uppercase tracking-widest">Connect</h3>
            <ul className="space-y-6 text-sm font-medium">
              <li className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-brand-primary shrink-0" />
                <span className="leading-relaxed">H. No. 176 Near Panchayat Bhawan, Jamai Chhindwara 480551</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-brand-primary shrink-0" />
                <span>{formatDisplayPhone(phoneNumber)}</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-brand-primary shrink-0" />
                <span>Viyomkeshartvision@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/5 py-[60px]">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-white font-display font-black text-2xl mb-4">Join Our Newsletter</h3>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">Get exclusive updates on new printing techniques, special discounts, and art inspiration directly in your inbox.</p>
            
            <form onSubmit={handleSubscribe} className="relative max-w-md mx-auto">
              <input 
                type="email" 
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-8 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 bg-brand-primary text-white px-6 rounded-full font-bold hover:bg-brand-primary/90 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            
            {status.type && (
              <p className={`mt-4 text-sm font-bold ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {status.message}
              </p>
            )}
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-[60px] flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-600">
          <div className="flex flex-col items-center md:items-start space-y-2 mb-8 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Viyomkesh Art Vision</p>
            <p>Built with precision by <a href="https://www.royalzinformatics.com" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-white transition-colors">Royalz Informatics</a></p>
          </div>
          <div className="flex space-x-8">
            <Link to="/admin" className="hover:text-white transition-colors border border-white/10 px-6 py-3 rounded-full">Portal Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
