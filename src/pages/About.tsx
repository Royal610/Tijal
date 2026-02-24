import { Printer, Users, Award, Clock } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">About Viyomkesh Art Vision</h1>
          <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto">
            Your trusted partner in professional printing since 2010. We bring your ideas to life with precision and quality.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-slate-600">
              <p>
                Founded with a vision to revolutionize the local printing industry, Viyomkesh Art Vision started as a small shop focusing on visiting cards and ID cards. Over the years, we've grown into a full-service printing hub.
              </p>
              <p>
                Today, we serve hundreds of businesses, providing everything from digital printing and large format banners to personalized corporate gifts. Our commitment to quality and customer satisfaction remains our driving force.
              </p>
              <p>
                We invest in the latest printing technology to ensure that every project, big or small, meets the highest standards of excellence.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://picsum.photos/seed/about/800/1000" 
              alt="Our Printing Facility" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Stats/Values */}
      <div className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">5000+</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Happy Clients</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Printer className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">1M+</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Prints Delivered</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">15+</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">24/7</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Customer Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
