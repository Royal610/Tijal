import { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, LayoutDashboard, MessageSquare, Users } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'testimonials' | 'inquiries'>('services');
  const [loading, setLoading] = useState(true);

  // Data states
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Form states
  const [newService, setNewService] = useState({ title: '', description: '', image_url: '', category: '' });
  const [newTestimonial, setNewTestimonial] = useState({ client_name: '', content: '', rating: 5 });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    try {
      if (activeTab === 'services') {
        const res = await fetch('/api/services');
        setServices(await res.json());
      } else if (activeTab === 'testimonials') {
        const res = await fetch('/api/testimonials');
        setTestimonials(await res.json());
      } else if (activeTab === 'inquiries') {
        const res = await fetch('/api/inquiries');
        setInquiries(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      setNewService({ title: '', description: '', image_url: '', category: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTestimonial)
      });
      setNewTestimonial({ client_name: '', content: '', rating: 5 });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Admin Login</h2>
            <p className="mt-2 text-center text-sm text-slate-600">Password is 'admin' for demo</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> Services
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'testimonials' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <Users className="mr-3 h-5 w-5" /> Testimonials
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'inquiries' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <MessageSquare className="mr-3 h-5 w-5" /> Inquiries
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Manage Services</h2>
            </div>
            
            {/* Add Service Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
              <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Title" required className="border p-2 rounded" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
                <input type="text" placeholder="Category" required className="border p-2 rounded" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} />
                <input type="url" placeholder="Image URL" required className="border p-2 rounded" value={newService.image_url} onChange={e => setNewService({...newService, image_url: e.target.value})} />
                <input type="text" placeholder="Description" required className="border p-2 rounded md:col-span-2" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-2 flex items-center justify-center hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" /> Add Service
                </button>
              </form>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {services.map(service => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-md object-cover" src={service.image_url} alt="" referrerPolicy="no-referrer" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{service.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{service.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => deleteService(service.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Manage Testimonials</h2>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add New Testimonial</h3>
              <form onSubmit={addTestimonial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Client Name" required className="border p-2 rounded" value={newTestimonial.client_name} onChange={e => setNewTestimonial({...newTestimonial, client_name: e.target.value})} />
                <select className="border p-2 rounded" value={newTestimonial.rating} onChange={e => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <textarea placeholder="Content" required className="border p-2 rounded md:col-span-2" value={newTestimonial.content} onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}></textarea>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-2 flex items-center justify-center hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {testimonials.map(t => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{t.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.rating} Stars</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => deleteTestimonial(t.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Customer Inquiries</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {inquiries.map(inq => (
                    <tr key={inq.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inq.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div>{inq.email}</div>
                        <div>{inq.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={inq.message}>
                        {inq.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inquiries.length === 0 && (
                <div className="p-8 text-center text-slate-500">No inquiries yet.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
