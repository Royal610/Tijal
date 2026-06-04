import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  client_name: string;
  content: string;
  rating: number;
}

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        }
      })
      .catch(err => console.error('Error fetching testimonials:', err));
  }, []);

  if (testimonials.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 400; // rough width of a card + gap
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-[100px] pb-0 bg-white relative overflow-hidden group/section">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-brand-primary rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between text-left">
          <div>
            <h2 className="text-sm font-bold tracking-[0.3em] text-brand-primary uppercase mb-4">Customer Stories</h2>
            <h3 className="text-4xl md:text-5xl font-display font-black text-slate-900 leading-tight">What Our Clients <br className="hidden md:block" /> Are Saying</h3>
          </div>
          <div className="hidden md:flex space-x-4 mt-6 md:mt-0">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors focus:outline-none"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full bg-brand-primary border-2 border-brand-primary flex items-center justify-center text-white hover:bg-brand-primary/90 transition-colors focus:outline-none"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 pt-4 px-4 sm:px-6 lg:px-8 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Duplicate for infinite feel visual loop if < 3 testimonials, but here we just map what we have. Also CSS to hide scrollbar */}
              <style dangerouslySetInnerHTML={{__html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
              `}} />
            
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-slate-50 w-[300px] md:w-[400px] shrink-0 snap-center rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-xl relative overflow-hidden group text-left flex flex-col h-full"
                >
                  <div className="absolute top-6 left-6 text-brand-primary/10 group-hover:scale-110 transition-transform duration-500">
                    <Quote size={60} strokeWidth={3} />
                  </div>
                  
                  <div className="relative z-10 flex-grow pt-4">
                    <div className="flex text-yellow-400 mb-6 space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className={i < testimonial.rating ? "fill-current" : "text-slate-200"} />
                      ))}
                    </div>

                    <p className="text-lg font-medium text-slate-700 leading-relaxed mb-8 italic flex-grow">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <div className="flex items-center mt-auto border-t border-slate-200/60 pt-6">
                    <div className="w-12 h-12 rounded-full flex-shrink-0 bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl font-black mr-4 ring-2 ring-white shadow-sm">
                      {testimonial?.client_name ? testimonial.client_name.charAt(0) : '?'}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{testimonial?.client_name || 'Anonymous'}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Partner</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
