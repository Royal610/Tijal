import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setFeaturedServices(data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/printing/1920/1080?blur=2" 
            alt="Printing Press" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Professional Printing Solutions for Your Business
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl">
              From ID cards and visiting cards to large format digital printing and banners. We deliver high-quality prints with fast turnaround times.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/services" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Explore Services
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-white bg-transparent hover:bg-slate-800 transition-colors"
              >
                Get a Free Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Viyomkesh Art Vision?</h2>
            <p className="mt-4 text-lg text-slate-600">We combine technology with craftsmanship to deliver the best results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Premium Quality', desc: 'We use top-tier materials and advanced printing technology.' },
              { title: 'Fast Turnaround', desc: 'Quick delivery without compromising on quality.' },
              { title: 'Competitive Pricing', desc: 'Affordable rates for businesses of all sizes.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                <CheckCircle2 className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Our Popular Services</h2>
              <p className="mt-4 text-lg text-slate-600">Discover what we do best.</p>
            </div>
            <Link to="/services" className="hidden md:flex items-center text-blue-600 font-medium hover:text-blue-700">
              View All Services <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <img src={service.image_url} alt={service.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                <div className="p-6">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{service.category}</span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-2 text-slate-600 line-clamp-2">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/services" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
              View All Services <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start your next printing project?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your requirements and get a custom quote tailored to your needs.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-lg"
          >
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
}
