import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  client_name: string;
  content: string;
  rating: number;
}

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-brand-primary rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="mb-16">
          <h2 className="text-sm font-bold tracking-[0.3em] text-brand-primary uppercase mb-4">Customer Stories</h2>
          <h3 className="text-4xl md:text-5xl font-display font-black text-slate-900 leading-tight">What Our Clients <br className="hidden md:block" /> Are Saying</h3>
        </div>

        <div className="relative max-w-4xl mx-auto h-[400px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-4"
            >
              <div className="bg-slate-50 rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-xl relative overflow-hidden group">
                <div className="absolute top-8 left-8 text-brand-primary/10 group-hover:scale-110 transition-transform duration-500">
                  <Quote size={80} strokeWidth={3} />
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="flex justify-center text-yellow-400 mb-8 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={24} className={i < currentTestimonial.rating ? "fill-current" : "text-slate-200"} />
                    ))}
                  </div>

                  <p className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed mb-10 italic">
                    "{currentTestimonial.content}"
                  </p>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-2xl font-black mb-4 ring-4 ring-white shadow-lg">
                      {currentTestimonial?.client_name ? currentTestimonial.client_name.charAt(0) : '?'}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{currentTestimonial?.client_name || 'Anonymous'}</h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Partner</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            className="absolute left-[-20px] md:left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 hover:bg-brand-primary hover:text-white transition-all z-20 group"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            className="absolute right-[-20px] md:right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 hover:bg-brand-primary hover:text-white transition-all z-20 group"
            onClick={() => paginate(1)}
          >
            <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex justify-center space-x-3 mt-12 pb-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-10 bg-brand-primary' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
