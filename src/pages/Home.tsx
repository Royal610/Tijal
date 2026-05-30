import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedServices(data.slice(0, 4));
        } else {
          console.error("Failed to load services:", data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Hero Banners */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Left Banner: Business Cards */}
          <div className="bg-[#EAEAEA] relative overflow-hidden flex min-h-[300px] group rounded-[4px] cursor-pointer" onClick={(e) => { e.preventDefault(); window.location.href='/services'; }}>
            <div className="absolute inset-y-0 right-0 w-[65%]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#EAEAEA] via-[#EAEAEA]/85 to-transparent z-10 w-1/2"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#EAEAEA]/20 to-[#EAEAEA] z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800"
                alt="Business Cards"
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="relative z-20 w-full sm:w-[60%] p-8 sm:p-12 pl-8 sm:pl-12 flex flex-col justify-center">
              <h2 className="text-[32px] font-bold text-slate-900 mb-2 font-sans tracking-tight">Business Cards</h2>
              <p className="text-slate-800 text-[15px] max-w-[200px] font-medium leading-snug">
                a perfect first impression with your clients
              </p>
            </div>
          </div>

          {/* Right Banner: ID Cards */}
          <div className="bg-[#E5E5E5] relative overflow-hidden flex min-h-[300px] group rounded-[4px] cursor-pointer" onClick={(e) => { e.preventDefault(); window.location.href='/services'; }}>
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E5E5E5] via-[#E5E5E5]/95 to-transparent z-10 w-[70%]"></div>
              <img 
                src="/images/home-banner.png"
                alt="ID Cards"
                className="w-full h-full object-cover object-[50%_20%] absolute right-0 inset-y-0 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="relative z-20 w-full sm:w-[70%] p-8 flex flex-col justify-center">
              <h2 className="text-[28px] sm:text-[30px] font-bold text-slate-900 mb-3 leading-[1.15] font-sans tracking-tight max-w-[300px]">Premium ID Cards For Your Organization</h2>
              <p className="text-slate-800 text-[13px] max-w-[300px] font-medium leading-[1.6]">
                Professional, durable, and secure ID cards with smart chip, RFID, and standard PVC options. Perfect for employees, events, and education.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Original Products (Preserving Previous Functionality) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full mt-4">
         <h2 className="text-2xl font-bold text-center text-slate-800 mb-8 font-sans tracking-tight">Our Core Printing Services</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <Link to={`/services/${service.id}`} key={service.id} className="group flex flex-col h-full cursor-pointer">
                <div className="flex-grow aspect-square overflow-hidden bg-slate-100 flex items-center justify-center relative rounded-md">
                  <img src={service.image_url || undefined} alt={service.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-center font-semibold text-slate-700 mt-3 text-[14px] group-hover:text-blue-600">{service.title}</h3>
              </Link>
            ))}
         </div>
         <div className="text-center mt-10">
            <Link to="/services" className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-8 rounded text-sm transition-colors shadow-sm">
                View All Products & Services
            </Link>
         </div>
      </section>

      {/* Shop for Your Business Needs */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full mb-10 border-t border-slate-100 mt-8">
        <h2 className="text-[30px] font-bold text-center text-slate-800 mb-10 font-sans tracking-tight mt-6">Shop for Your Business Needs</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group flex flex-col h-full">
            <div className="flex-grow aspect-square overflow-hidden bg-slate-100 flex items-center justify-center relative rounded-[10px]">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                alt="Education & Campus Needs" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-center font-bold text-slate-800 mt-5 text-[15px] transition-colors">Education & Campus Needs</h3>
          </div>
          
          <div className="group flex flex-col h-full">
            <div className="flex-grow aspect-square overflow-hidden bg-slate-100 flex items-center justify-center relative rounded-[10px]">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800" 
                alt="Startup Branding" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-center font-bold text-slate-800 mt-5 text-[15px] transition-colors">Startup Branding</h3>
          </div>

          <div className="group flex flex-col h-full">
            <div className="flex-grow aspect-square overflow-hidden bg-slate-100 flex items-center justify-center relative rounded-[10px]">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800" 
                alt="Event and Promotions" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-center font-bold text-slate-800 mt-5 text-[15px] transition-colors">Event and Promotions</h3>
          </div>

          <div className="group flex flex-col h-full">
            <div className="flex-grow aspect-square overflow-hidden bg-slate-100 flex items-center justify-center relative rounded-[10px]">
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800" 
                alt="Gifts" 
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-center font-bold text-slate-800 mt-5 text-[15px] transition-colors">Gifts</h3>
          </div>
        </div>
      </section>

    </div>
  );
}
