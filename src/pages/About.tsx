import { Printer, Users, Award, Clock, ArrowRight, Target, Lightbulb, Zap, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO';

export default function About() {
  const [counters, setCounters] = useState({
    clients: { value: "5,000+", label: "Happy Clients" },
    prints: { value: "1M+", label: "Prints Delivered" },
    experience: { value: "15+", label: "Years Experience" },
    quality: { value: "100%", label: "Quality Guaranteed" }
  });
  const [directors, setDirectors] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1629904853716-f0bc54eea481?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.about_hero_image) {
          setHeroImage(data.about_hero_image);
        }
      })
      .catch(console.error);

    fetch('/api/about-counters')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const newCounters = { ...counters };
          data.forEach(c => {
            if (newCounters[c.key_name as keyof typeof newCounters]) {
              newCounters[c.key_name as keyof typeof newCounters] = {
                value: c.value,
                label: c.label || newCounters[c.key_name as keyof typeof newCounters].label
              };
            }
          });
          setCounters(newCounters);
        }
      })
      .catch(console.error);

    fetch('/api/directors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDirectors(data);
      })
      .catch(console.error);

    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.about_hero_image) {
          setHeroImage(data.about_hero_image);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-transparent scroll-smooth">
      <SEO 
        title="About Our Journey | Printing Experts in Chhindwara"
        description="Discover the story behind Viyomkesh Art Vision. From a small press to a leading printing solution provider, learn about our mission to deliver premium quality with precision."
      />
      {/* Header / Hero Section */}
      <div className="relative bg-slate-900 py-32 overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#F27C21]/20 to-transparent blur-3xl"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-[#F27C21]/20 via-[#d5a46d]/10 to-transparent blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 mix-blend-overlay"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-[#F27C21] mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F27C21] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F27C21]"></span>
            </span>
            EST 2025
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Pioneering the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F27C21] to-[#f5ab6e]">Print</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            We merge traditional craftsmanship with next-generation digital technology to bring your boldest ideas to life.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F27C21] to-[#d5a46d] rounded-[2rem] transform rotate-3 scale-105 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
            <div className="relative h-[500px] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 transform transition-transform duration-500 group-hover:-translate-y-2">
              <img 
                src={heroImage} 
                alt="Our Printing Facility" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <p className="font-bold text-2xl">Modern Facility</p>
                <p className="text-slate-200">State-of-the-art equipment</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[#F27C21] uppercase mb-3">Our Origins</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">From a small press to an <span className="font-serif italic text-slate-500">industry leader</span>.</h3>
            </div>
            
            <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed">
              <p className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-1 before:bg-[#F27C21] before:rounded-full">
                Founded with a vision to revolutionize the local printing industry, Viyomkesh Art Vision started as a humble shop focusing on visiting cards and ID cards. Over the years, our unwavering commitment has transformed us into a full-service printing powerhouse.
              </p>
              <p>
                Today, we serve hundreds of businesses globally, providing everything from high-fidelity digital printing and large format banners to meticulously crafted personalized corporate gifts. Our dedication to unmatched quality and supreme customer satisfaction remains our ultimate driving force.
              </p>
              <p>
                We relentlessly invest in the latest printing technology, ensuring that every project—whether an expansive marketing campaign or an artisanal custom batch—meets the absolute highest standards of excellence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission Section */}
      <div className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10 mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision Card */}
            <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-10 lg:p-12 rounded-3xl border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.8)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 text-white shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Lightbulb className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-sm">Our Vision</h2>
                <p className="text-lg text-blue-50 leading-relaxed font-medium">
                  Our vision is to be the premier catalyst for visual communication by redefining the standards of the digital printing industry. We are committed to bridging the gap between exceptional, <strong className="text-white font-bold tracking-wide">showroom-grade print quality</strong> and absolute cost efficiency. By leveraging cutting-edge technology and optimized production workflows, we aim to empower startups, corporations, and individuals alike with vivid, durable, and precise print solutions. We envision a future where high-end presentation and premium marketing materials are accessible to every budget, enabling our customers to grow their brands without financial compromise.
                </p>
              </div>
            </div>
            
            {/* Mission Card */}
            <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-10 lg:p-12 rounded-3xl border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.8)] transition-all duration-500 hover:-translate-y-2 mt-8 md:mt-16 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:bg-white/20 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 text-white shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <Target className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-sm">Our Mission</h2>
                <p className="text-lg text-blue-50 leading-relaxed font-medium">
                  To deliver superior print solutions with unmatched <strong className="text-white font-bold tracking-wide">precision, speed, and reliability</strong>. We relentlessly pursue operational excellence to ensure our clients receive high-quality materials—spanning from bespoke business cards to large-format displays—exactly when they need them. We strive to be a dependable extension of our clients' teams, providing expert guidance, innovative techniques, and sustainable practices to help them make a lasting impression in a hyper-competitive marketplace.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Leadership Section */}
      {directors.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold tracking-widest text-[#F27C21] uppercase mb-3">Our Leadership</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Guided by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Vision</span> & Passion</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
              {directors.map((director) => (
                <div key={director.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#F27C21] to-[#d5a46d] rounded-[2.5rem] transform rotate-2 opacity-10 group-hover:rotate-4 transition-transform duration-500"></div>
                  <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="aspect-[4/5] overflow-hidden relative bg-slate-100">
                      <img 
                        src={director.image_url || undefined} 
                        alt={director.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                    </div>
                    <div className="p-10 text-center flex-grow flex flex-col">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{director.name}</h3>
                      <p className="text-[#F27C21] font-bold uppercase tracking-[0.2em] text-xs mb-4">{director.role}</p>
                      <p className="text-slate-600 font-sans leading-relaxed italic line-clamp-4">"{director.bio}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats/Values (About Counters) */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#F27C21] uppercase mb-3">Our Impact</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Numbers</span> of Trust</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4 font-sans leading-relaxed">A testament to our dedication, precision, and the trust our clients place in us daily.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { icon: <Users className="h-8 w-8" />, stat: counters.clients.value, label: counters.clients.label, color: "text-[#F27C21]", bg: "bg-[#F27C21]/10" },
              { icon: <Printer className="h-8 w-8" />, stat: counters.prints.value, label: counters.prints.label, color: "text-blue-600", bg: "bg-blue-100" },
              { icon: <Award className="h-8 w-8" />, stat: counters.experience.value, label: counters.experience.label, color: "text-emerald-600", bg: "bg-emerald-100" },
              { icon: <ShieldCheck className="h-8 w-8" />, stat: counters.quality.value, label: counters.quality.label, color: "text-purple-600", bg: "bg-purple-100" },
            ].map((item, idx) => (
              <div key={idx} className="group text-center p-8 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`mx-auto h-20 w-20 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-all duration-300 shadow-sm`}>
                  {item.icon}
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight mb-2 font-sans">{item.stat}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Clients Section */}
      {clients.length > 0 && (
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold tracking-widest text-[#F27C21] uppercase mb-3">Our Valued Clients</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Trusted by Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Leaders</span></h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4 font-sans leading-relaxed">We are honored to partner with organizations that prioritize excellence and high-impact visual representation.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clients.map((client) => (
                <div key={client.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2 group-hover:bg-white transition-colors flex-shrink-0">
                      <img 
                        src={client.image_url || undefined} 
                        alt={client.name} 
                        className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599305445671-ac291c95aa9c?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{client.name}</h4>
                      {client.website && (
                        <a 
                          href={client.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-500 font-bold hover:underline flex items-center mt-2 group/link"
                        >
                          Visit Platform
                          <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 relative">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#F27C21]/20 rounded-full"></div>
                    <p className="text-slate-600 font-sans leading-relaxed pl-2 italic line-clamp-3">
                      "{client.description}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
    </div>
  );
}
