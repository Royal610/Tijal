import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/services' },
    { name: 'Testimonials', path: '/testimonials' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Viyomkesh Art Vision Logo" className="h-14 w-auto object-contain" />
              <div className="hidden lg:block">
                <span className="block text-lg font-display font-bold leading-none text-slate-900">Viyomkesh</span>
                <span className="block text-[10px] tracking-[0.2em] uppercase font-semibold text-brand-primary">Art Vision</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "text-sm font-semibold tracking-wide transition-all hover:text-brand-primary uppercase",
                  location.pathname === link.path ? "text-brand-primary" : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Company Dropdown */}
            <div 
              className="relative group h-full flex items-center"
              onMouseEnter={() => setIsCompanyOpen(true)}
              onMouseLeave={() => setIsCompanyOpen(false)}
            >
              <button className={clsx(
                "flex items-center text-sm font-semibold tracking-wide transition-all hover:text-brand-primary uppercase bg-transparent border-none cursor-pointer",
                companyLinks.some(link => location.pathname === link.path) ? "text-brand-primary" : "text-slate-600"
              )}>
                Company
                <ChevronDown className={clsx("ml-1 h-4 w-4 transition-transform duration-300", isCompanyOpen && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {isCompanyOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden py-2"
                  >
                    {companyLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={clsx(
                          "block px-4 py-3 text-sm font-medium transition-colors",
                          location.pathname === link.path ? "bg-slate-50 text-brand-primary" : "text-slate-600 hover:bg-slate-50 hover:text-brand-primary"
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/contact"
              className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-brand-primary/20"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-brand-primary focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "block px-4 py-3 rounded-xl text-base font-bold",
                    location.pathname === link.path
                      ? "text-brand-primary bg-brand-primary/5"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 px-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Company</p>
                {companyLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "block py-2 text-base font-bold",
                      location.pathname === link.path ? "text-brand-primary" : "text-slate-600"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="pt-4">
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-brand-primary text-white py-4 rounded-2xl font-bold"
                >
                  Get a Quote
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
