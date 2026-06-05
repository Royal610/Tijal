import { useEffect, useState } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';

interface Service {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  price?: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category))).filter(c => c !== 'All')];

  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-transparent min-h-screen pb-20">
      <SEO 
        title="Our Premium Services | ID Cards, Banners & More"
        description="Explore our wide range of professional printing services. From corporate ID cards and high-end visiting cards to digital printing and artisanal custom gifts."
      />
      {/* Header */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px] -ml-24 -mb-24" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6">Our <span className="text-brand-primary">Services</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              We offer a comprehensive range of premium printing solutions tailored to your unique requirements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Filters and Search */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 border border-slate-100 mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
              <div className="flex items-center space-x-2 mr-4 text-slate-400">
                <Filter className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-bold uppercase tracking-wider hidden sm:block">Filter</span>
              </div>
              <div className="flex space-x-2">
                {categories.map((category, idx) => (
                  <button
                    key={`cat-${category}-${idx}`}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      selectedCategory === category
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search our catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, i) => (
                <motion.div
                  key={`srv-${service.id}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group"
                >
                  <Link to={`/services/${service.id}`} className="block h-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={service.image_url || undefined} 
                        alt={service.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-6 left-6">
                        <span className="bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full text-slate-900 shadow-xl">
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-10 flex flex-col flex-grow">
                      <h3 className="text-2xl font-display font-black text-slate-900 mb-4 group-hover:text-brand-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed line-clamp-3 mb-8 flex-grow">
                        {service.description}
                      </p>
                      <div className="flex items-center text-brand-primary font-black uppercase tracking-widest text-xs">
                        View Details
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredServices.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200"
          >
            <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-2xl font-display font-bold text-slate-400 mb-4">No results found</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="text-brand-primary font-bold underline underline-offset-4"
            >
              Reset filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Final CTA */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <h2 className="text-4xl lg:text-5xl font-display font-black text-white mb-8 relative z-10">Can't find what you're looking for?</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto relative z-10">We handle custom requests and bulk orders every day. Get in touch for a bespoke solution.</p>
          <Link to="/contact" className="inline-flex items-center px-12 py-5 bg-brand-primary text-white rounded-full font-black hover:scale-105 transition-transform shadow-2xl shadow-brand-primary/40 relative z-10">
            Discuss Custom Project
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
