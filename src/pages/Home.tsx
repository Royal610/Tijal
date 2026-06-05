import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Printer, Shield, Zap, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import TestimonialCarousel from '../components/TestimonialCarousel';

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80&w=1200');

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedServices(data);
        }
      })
      .catch(err => console.error(err));

    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      })
      .catch(err => console.error(err));

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.home_hero_image) {
          setHeroImage(data.home_hero_image);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const features = [
    { icon: <Printer className="w-6 h-6" />, title: "Precision Printing", desc: "Ultra-high resolution results." },
    { icon: <Zap className="w-6 h-6" />, title: "Fast Turnaround", desc: "Your orders, delivered on time." },
    { icon: <Shield className="w-6 h-6" />, title: "Premium Quality", desc: "Durable and high-grade materials." },
    { icon: <Heart className="w-6 h-6" />, title: "Client Focused", desc: "Personalized service for every need." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent overflow-hidden">
      <SEO 
        title="Viyomkesh Art Vision | Premium Printing, ID Cards & Branding"
        description="Experience world-class printing with Viyomkesh Art Vision. Specializing in corporate ID cards, premium visiting cards, digital printing, and custom branding solutions in Jamai Chhindwara."
      />
      
      {/* Hero Section */}
      <section className="relative pt-4 pb-0 lg:pt-8 lg:pb-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 bg-brand-primary/10 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Premium Printing Solutions</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-black text-slate-900 leading-[1.1] mb-6">
                Bringing Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Vision</span> to Life
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
                Viyomkesh Art Vision specializes in delivering professional, durable, and high-impact printing services for businesses and individuals worldwide.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:y-0 sm:space-x-4">
                <Link to="/services" className="px-8 py-4 bg-brand-primary text-white rounded-full font-bold shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform flex items-center justify-center">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/contact" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors flex items-center justify-center">
                  Request a Quote
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="High quality printing" 
                  className="w-full aspect-square object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pt-[100px] pb-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-[2rem] bg-white border border-slate-100 hover:shadow-xl transition-shadow group cursor-default"
            >
              <div className="w-12 h-12 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories / Services Grid */}
      <section className="pt-[100px] pb-24 bg-slate-900 text-white rounded-[2.5rem] lg:rounded-[4rem] mx-4 lg:mx-8 relative overflow-hidden mt-10 md:mt-16">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-primary via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-[0.3em] text-brand-primary uppercase mb-4">Our Expertise</h2>
            <h3 className="text-4xl md:text-5xl font-display font-black mb-6">Wide Range of <br className="hidden md:block"/> Printing Services</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">From personal gifts to large-scale corporate branding, we deliver unparalleled quality across every category.</p>
          </div>

          <div className="relative overflow-hidden">
            <motion.div 
              className="flex space-x-8"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: Math.max(featuredServices.length * 8, 20),
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{ width: "fit-content" }}
            >
              {[...featuredServices, ...featuredServices].map((service, i) => (
                <div
                  key={`home-feat-${service.id}-${i}`}
                   className="w-[300px] md:w-[400px] shrink-0"
                >
                  <Link to={`/services/${service.id}`} className="group block focus:outline-none">
                    <div className="relative h-[175px] md:h-[300px] rounded-[2rem] overflow-hidden mb-6">
                      <img 
                        src={service.image_url || undefined} 
                        alt={service.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-1">{service.category || 'Service'}</p>
                        <h4 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">{service.title}</h4>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <TestimonialCarousel />

      {/* CTA Section */}
      <section className="pt-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-4 md:mt-8">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="bg-brand-primary/5 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-display font-black text-slate-900 mb-8 max-w-3xl mx-auto leading-tight">Ready to start your next printing project?</h2>
            <p className="text-lg text-slate-600 mb-12 max-w-xl mx-auto leading-relaxed">Let us handle the complexity. Our team of experts is ready to provide you with a custom quote tailored to your specific requirements.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:y-0 sm:space-x-6">
              <Link to="/contact" className="px-12 py-5 bg-brand-primary text-white rounded-full font-black shadow-2xl shadow-brand-primary/40 hover:scale-105 transition-transform">
                Get Your Free Quote
              </Link>
              <Link to="/about" className="px-12 py-5 bg-white text-slate-900 border border-slate-200 rounded-full font-black hover:bg-slate-50 transition-colors">
                Learn About Us
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
