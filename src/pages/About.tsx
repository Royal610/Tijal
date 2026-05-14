import { Printer, Users, Award, Clock, ArrowRight, Target, Lightbulb, Zap, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function About() {
  const [counters, setCounters] = useState({
    clients: "5,000+",
    prints: "1M+",
    experience: "15+",
    quality: "100%"
  });

  useEffect(() => {
    fetch('/api/settings/counters')
      .then(res => res.json())
      .then(data => {
        setCounters({
          clients: data.clients || "5,000+",
          prints: data.prints || "1M+",
          experience: data.experience || "15+",
          quality: data.quality || "100%"
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white scroll-smooth">
      {/* Header / Hero Section */}
      <div className="relative bg-slate-900 py-32 overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#F27C21]/20 to-transparent blur-3xl"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-[#F27C21]/20 via-[#d5a46d]/10 to-transparent blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
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
                src="https://images.unsplash.com/photo-1629904853716-f0bc54eea481?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
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
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision Card */}
            <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-10 lg:p-12 rounded-3xl border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.8)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
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
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
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

      {/* Stats/Values */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Numbers that speak.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">A testament to our dedication, precision, and the trust our clients place in us.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { icon: <Users className="h-8 w-8" />, stat: counters.clients, label: "Happy Clients", color: "text-[#F27C21]", bg: "bg-[#F27C21]/10" },
              { icon: <Printer className="h-8 w-8" />, stat: counters.prints, label: "Prints Delivered", color: "text-blue-600", bg: "bg-blue-100" },
              { icon: <Award className="h-8 w-8" />, stat: counters.experience, label: "Years Experience", color: "text-emerald-600", bg: "bg-emerald-100" },
              { icon: <ShieldCheck className="h-8 w-8" />, stat: counters.quality, label: "Quality Guaranteed", color: "text-purple-600", bg: "bg-purple-100" },
            ].map((item, idx) => (
              <div key={idx} className="group text-center p-8 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`mx-auto h-20 w-20 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-all duration-300 shadow-sm`}>
                  {item.icon}
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{item.stat}</h3>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
