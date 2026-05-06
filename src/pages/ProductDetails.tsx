import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Star } from 'lucide-react';

interface Service {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  price?: string;
}

interface Review {
  id: number;
  reviewer_name: string;
  content: string;
  rating: number;
  created_at: string;
}

interface Variant {
  id: number;
  service_id: number;
  title: string;
  price: string;
  image_url: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const allImages = Array.from(new Set([
    product?.image_url,
    ...variants.map(v => v.image_url)
  ].filter(Boolean) as string[]));

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  
  // Review form state
  const [newReview, setNewReview] = useState({ reviewer_name: '', content: '', rating: 5 });
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const fetchReviews = () => {
    fetch(`/api/services/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Error fetching reviews:", err));
  };

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Product not found');
        }
        return res.json();
      })
      .then(data => {
        setProduct(data);
        fetchReviews();
        fetch(`/api/services/${id}/variants`)
          .then(res => res.json())
          .then(vars => {
            setVariants(vars);
            if (vars.length > 0) setSelectedVariant(vars[0]);
          });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewStatus('submitting');
    try {
      const res = await fetch(`/api/services/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setReviewStatus('success');
        setNewReview({ reviewer_name: '', content: '', rating: 5 });
        fetchReviews();
        setTimeout(() => setReviewStatus('idle'), 3000);
      } else {
        setReviewStatus('error');
      }
    } catch (err) {
      console.error(err);
      setReviewStatus('error');
    }
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus('submitting');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inquiryForm,
          message: `Inquiry for ${product?.title}\nType: ${selectedVariant ? selectedVariant.title : 'Standard'}\nQuantity: ${quantity}\n${inquiryForm.message}`
        })
      });
      if (res.ok) {
        setInquiryStatus('success');
        setTimeout(() => {
          setIsModalOpen(false);
          setInquiryStatus('idle');
          setInquiryForm({ name: '', email: '', phone: '', message: '' });
        }, 3000);
      } else {
        setInquiryStatus('error');
      }
    } catch (err) {
      setInquiryStatus('error');
    }
  };

  const getDisplayedPrice = () => {
    if (variants.length > 0 && selectedVariant) {
      return selectedVariant.price;
    }
    return product?.price;
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-slate-50 min-h-screen py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || 'Product not found'}</h2>
        <Link to="/services" className="text-blue-600 hover:text-blue-800 flex items-center justify-center font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/services" className="inline-flex items-center text-slate-300 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{product.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Left Column: Image Carousel & Variants */}
            <div className="flex flex-col gap-8">
              {/* Image Carousel */}
              <div className="w-full relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden bg-slate-100 group shadow-inner border border-slate-200">
                {allImages.length > 0 ? allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Slide ${idx}`}
                    className={`absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-700 ${
                      idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                )) : product?.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="absolute inset-0 w-full h-full object-contain bg-white"
                    referrerPolicy="no-referrer"
                  />
                )}
                {/* Carousel controls */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all shadow-sm ${
                          idx === currentImageIndex ? 'bg-blue-600 scale-110' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Variants underneath image */}
              {variants.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <label className="font-bold text-slate-900 mb-4 block text-lg">Select Option / Category:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {variants.map((variant) => {
                      const imgIndex = allImages.indexOf(variant.image_url || product?.image_url || '');
                      return (
                        <div 
                          key={variant.id} 
                          onClick={() => {
                            setSelectedVariant(variant);
                            if (imgIndex !== -1) setCurrentImageIndex(imgIndex);
                          }}
                          className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${selectedVariant?.id === variant.id ? 'border-blue-600 shadow-md ring-2 ring-blue-600 ring-opacity-20 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-white'}`}
                        >
                          <div className="h-24 bg-slate-100 relative">
                            <img 
                              src={variant.image_url || product?.image_url} 
                              alt={variant.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-2 text-center flex flex-col justify-between h-20">
                            <div className="font-semibold text-xs text-slate-900 line-clamp-2" title={variant.title}>{variant.title}</div>
                            <div className="text-blue-600 font-bold text-sm mt-1">{variant.price}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Details & Actions */}
            <div className="flex flex-col pt-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold uppercase tracking-wider rounded-full mb-6 w-max">
                {product.category}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                {selectedVariant ? `${product.title} - ${selectedVariant.title}` : product.title}
              </h2>
              
              {getDisplayedPrice() && (
                <div className="text-3xl font-semibold text-blue-600 mb-8 bg-blue-50 py-3 px-5 rounded-lg inline-block w-max">
                  {getDisplayedPrice()}
                </div>
              )}

              <div className="prose prose-slate prose-lg max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              <div className="mt-8 lg:mt-auto border-t border-slate-200 pt-8 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="font-bold text-slate-900 w-20">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-sm w-max">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors rounded-l-lg disabled:opacity-50 border-r border-slate-300"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input 
                      type="number" 
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center py-3 focus:outline-none font-bold text-slate-900 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors rounded-r-lg border-l border-slate-300"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md w-full"
                  >
                    Inquire For Bulk Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b pb-4">Customer Reviews</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <p className="text-slate-500 italic bg-white p-6 rounded-xl border border-slate-200">No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-semibold text-slate-900">{review.reviewer_name}</div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600">{review.content}</p>
                    <div className="text-sm text-slate-400 mt-4">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-max">
              <h4 className="text-xl font-bold text-slate-900 mb-6">Write a Review</h4>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    value={newReview.reviewer_name}
                    onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: num })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${num <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Review</label>
                  <textarea 
                    required 
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={reviewStatus === 'submitting'}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {reviewStatus === 'submitting' ? 'Submitting...' : 'Submit Review'}
                </button>
                {reviewStatus === 'success' && (
                  <p className="text-green-600 text-sm text-center">Review submitted successfully!</p>
                )}
                {reviewStatus === 'error' && (
                  <p className="text-red-600 text-sm text-center">Failed to submit review. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pr-8">Bulk Inquiry</h3>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-sm text-slate-700 space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">Product</span>
                <span className="font-medium text-slate-900 text-right pl-4">{product.title}</span>
              </div>
              {selectedVariant && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Type</span>
                  <span className="font-medium text-slate-900 text-right pl-4">{selectedVariant.title}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Quantity</span>
                <span className="font-medium text-slate-900">{quantity}</span>
              </div>
            </div>

            <form onSubmit={submitInquiry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    required 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message / Requirements</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  placeholder="Tell us your target price or any specific requirements..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={inquiryStatus === 'submitting'}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-2"
              >
                {inquiryStatus === 'submitting' ? 'Submitting...' : 'Send Inquiry'}
              </button>
              
              {inquiryStatus === 'success' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-green-700 text-sm text-center">
                  Inquiry sent successfully! We'll get back to you soon.
                </div>
              )}
              {inquiryStatus === 'error' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-red-700 text-sm text-center">
                  Failed to send inquiry. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
