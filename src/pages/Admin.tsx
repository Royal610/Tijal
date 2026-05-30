import React, { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, LayoutDashboard, MessageSquare, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [require2fa, setRequire2fa] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'testimonials' | 'inquiries' | 'settings'>('dashboard');
  const [dashboardStats, setDashboardStats] = useState({ totalProducts: 0, bulkInquiries: 0, totalInquiries: 0 });
  const [setup2faInfo, setSetup2faInfo] = useState<{qrCodeUrl: string, secret: string, alreadyEnabled?: boolean} | null>(null);

  const [setupToken, setSetupToken] = useState('');
  const [loading, setLoading] = useState(true);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, currentUrls: string, setter: (val: string) => void) => {
    const files = e.target.files;
    if (!files) return;
    const base64s = currentUrls ? currentUrls.split(',').filter(Boolean) : [];
    for (let i = 0; i < files.length; i++) {
      base64s.push(await convertToBase64(files[i]));
    }
    setter(base64s.join(','));
  };

  // Data states
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Form states
  const [newService, setNewService] = useState({ title: '', description: '', image_url: '', category: '', price: '' });
  const [newTestimonial, setNewTestimonial] = useState({ client_name: '', content: '', rating: 5 });

  // Variants state
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({ title: '', price: '', image_url: '' });
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editVariantForm, setEditVariantForm] = useState({ title: '', price: '', image_url: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
      if (isAuthenticated) {
      if (activeTab === 'dashboard') {
        fetch('/api/admin/dashboard').then(r => r.json()).then(setDashboardStats).catch(console.error);
      }
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
        body: JSON.stringify({ username, password, token })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
        setToken('');
        setRequire2fa(false);
        setSetup2faInfo(null);
      } else if (res.status === 401 && data.require2fa) {
        setRequire2fa(true);
      } else if (res.status === 401 && data.setup2fa) {
        setRequire2fa(true);
        setSetup2faInfo(data.setup2faInfo);
      } else {
        alert(data.error || 'Invalid login');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setup2fa = async () => {
    try {
      const res = await fetch('/api/admin/2fa/setup');
      setSetup2faInfo(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const verifySetup2fa = async () => {
    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: setupToken })
      });
      if (res.ok) {
        alert('2FA Enabled successfully!');
        setSetup2faInfo({ qrCodeUrl: '', secret: '', alreadyEnabled: true });
      } else {
        alert('Invalid token');
      }
    } catch (e) {
      console.error(e);
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
        const data = await res.json();
        if (Array.isArray(data)) setServices(data);
      } else if (activeTab === 'testimonials') {
        const res = await fetch('/api/testimonials');
        const data = await res.json();
        if (Array.isArray(data)) setTestimonials(data);
      } else if (activeTab === 'inquiries') {
        const res = await fetch('/api/inquiries');
        const data = await res.json();
        if (Array.isArray(data)) setInquiries(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      setNewService({ title: '', description: '', image_url: '', category: '', price: '' });
      await fetchData();
      // Assume the very next call fetches the latest, we will open the variants for the newest service
      const fetchRes = await fetch('/api/services');
      const latestServices = await fetchRes.json();
      if (Array.isArray(latestServices) && latestServices.length > 0) {
        viewVariants(latestServices[0].id);
      }
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

  const fetchVariants = async (serviceId: number) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/variants`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVariants(data);
      } else {
        setVariants([]);
      }
    } catch (err) {
      console.error(err);
      setVariants([]);
    }
  };

  const addVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;
    try {
      await fetch(`/api/services/${selectedServiceId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVariant)
      });
      setNewVariant({ title: '', price: '', image_url: '' });
      fetchVariants(selectedServiceId);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVariant = async (variantId: number) => {
    if (!confirm('Are you sure?')) return;
    if (!selectedServiceId) return;
    try {
      await fetch(`/api/services/${selectedServiceId}/variants/${variantId}`, { method: 'DELETE' });
      fetchVariants(selectedServiceId);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditVariant = (variant: any) => {
    setEditingVariantId(variant.id);
    setEditVariantForm({ title: variant.title, price: variant.price || '', image_url: variant.image_url || '' });
  };

  const saveEditVariant = async (variantId: number) => {
    if (!selectedServiceId) return;
    try {
      await fetch(`/api/services/${selectedServiceId}/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editVariantForm)
      });
      setEditingVariantId(null);
      fetchVariants(selectedServiceId);
    } catch (err) {
      console.error(err);
    }
  };

  const viewVariants = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    fetchVariants(serviceId);
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-0 -right-10 w-40 h-40 bg-magenta-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-10 left-20 w-40 h-40 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-10 right-20 w-40 h-40 bg-black rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl relative z-10 border-t-4 border-[#F27C21]">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl font-black text-white tracking-tighter">V<span className="text-[#F27C21]">A</span>V</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">Viyomkesh Art Vision Management</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Username</label>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F27C21] focus:border-transparent transition-all sm:text-sm shadow-sm"
                  placeholder="Enter administrator username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F27C21] focus:border-transparent transition-all sm:text-sm shadow-sm opacity-90"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {require2fa && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {setup2faInfo && (
                    <div className="mb-4 flex flex-col items-center">
                      <p className="text-sm text-slate-800 font-bold mb-2">Setup Google Authenticator</p>
                      <img src={setup2faInfo.qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 border rounded-lg shadow-sm mb-2" />
                      <p className="text-xs text-slate-500 text-center px-4">
                        Scan the QR code with Google Authenticator, then enter the 6-digit code below to login.
                      </p>
                    </div>
                  )}
                  <label className="text-sm font-semibold text-slate-700 block mb-2">2FA Token</label>
                  <input
                    type="text"
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F27C21] focus:border-transparent transition-all sm:text-sm shadow-sm font-mono tracking-widest text-center text-lg"
                    placeholder="000000"
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  {!setup2faInfo && <p className="mt-2 text-xs text-slate-500 text-center">Open Google Authenticator for your code</p>}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#F27C21] hover:bg-[#d66b1c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F27C21] shadow-lg transition-all"
            >
              Secure Login
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
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> Products
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'testimonials' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <Users className="mr-3 h-5 w-5" /> Testimonials
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'inquiries' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <MessageSquare className="mr-3 h-5 w-5" /> Inquiries
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setup2fa(); }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <Users className="mr-3 h-5 w-5" /> Security (2FA)
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
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="text-sm font-medium text-slate-500 mb-1">Total Products</div>
                <div className="text-3xl font-bold text-slate-900">{dashboardStats.totalProducts}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="text-sm font-medium text-slate-500 mb-1">Bulk Enquiries</div>
                <div className="text-3xl font-bold text-slate-900">{dashboardStats.bulkInquiries}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="text-sm font-medium text-slate-500 mb-1">Total Web Enquiries</div>
                <div className="text-3xl font-bold text-slate-900">{dashboardStats.totalInquiries}</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Analytics Overview</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Products', count: dashboardStats.totalProducts },
                      { name: 'Bulk Enquiries', count: dashboardStats.bulkInquiries },
                      { name: 'Web Enquiries', count: dashboardStats.totalInquiries }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#F27C21" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Security Settings</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 max-w-xl">
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication (2FA)</h3>
              
              {setup2faInfo === null ? (
                <p>Loading...</p>
              ) : setup2faInfo.alreadyEnabled ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                  Google Authenticator 2FA is currently <strong>Enabled</strong>.
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Scan this QR code with the Google Authenticator app on your phone:</p>
                  {setup2faInfo.qrCodeUrl && (
                    <img src={setup2faInfo.qrCodeUrl || undefined} alt="2FA QR Code" className="w-48 h-48 border rounded-md shadow-sm" />
                  )}
                  <p className="text-xs text-slate-500">Manual Entry Code: <span className="font-mono bg-slate-100 p-1 rounded">{setup2faInfo.secret}</span></p>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      className="border p-2 rounded mr-2"
                      value={setupToken}
                      onChange={e => setSetupToken(e.target.value)}
                    />
                    <button onClick={verifySetup2fa} className="bg-[#F27C21] text-white px-4 py-2 rounded">
                      Verify & Enable 2FA
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            {!selectedServiceId ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Manage Products</h2>
                </div>
                
                {/* Add Service Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                  <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
                  <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Product Name" required className="border p-2 rounded" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
                    <input type="text" placeholder="Category" required className="border p-2 rounded" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} />
                    <div className="border p-2 rounded flex items-center justify-between">
                      <span className="text-sm text-slate-500 mr-2">Product Image:</span>
                      <input type="file" accept="image/*" required onChange={e => handleImageUpload(e, newService.image_url, val => setNewService({...newService, image_url: val}))} className="text-sm" />
                    </div>
                    <input type="text" placeholder="Expected Number of Varieties (e.g., 5)" className="border p-2 rounded" />
                    <input type="text" placeholder="Base Price (e.g., ₹10 / unit)" className="border p-2 rounded" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                    <input type="text" placeholder="Description" required className="border p-2 rounded" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                    <button type="submit" className="bg-[#F27C21] text-white px-4 py-2 rounded md:col-span-2 flex items-center justify-center hover:bg-[#d66b1c]">
                      <Plus className="h-4 w-4 mr-2" /> Add Product
                    </button>
                  </form>
                </div>

                {/* Services List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {services.map(service => (
                        <tr key={service.id} className="cursor-pointer hover:bg-slate-50" onClick={() => viewVariants(service.id)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img className="h-10 w-10 rounded-md object-cover" src={(service.image_url && service.image_url.split(',')[0]) || undefined} alt="" referrerPolicy="no-referrer" />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{service.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{service.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={(e) => { e.stopPropagation(); deleteService(service.id); }} className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Manage Variants</h2>
                  <button onClick={() => setSelectedServiceId(null)} className="text-[#F27C21] hover:underline">
                    &larr; Back to Products
                  </button>
                </div>
                
                {/* Add Variant Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                  <h3 className="text-lg font-semibold mb-4">Add New Variant</h3>
                  <form onSubmit={addVariant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Variant Title (e.g., Red, Large)" required className="border p-2 rounded" value={newVariant.title} onChange={e => setNewVariant({...newVariant, title: e.target.value})} />
                    <input type="text" placeholder="Price (e.g., ₹15)" className="border p-2 rounded" value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: e.target.value})} />
                    <div className="border p-2 rounded md:col-span-2 flex items-center">
                      <span className="text-sm text-slate-500 mr-2">Variant Images:</span>
                      <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e, newVariant.image_url, val => setNewVariant({...newVariant, image_url: val}))} className="text-sm" />
                    </div>
                    <button type="submit" className="bg-[#F27C21] text-white px-4 py-2 rounded md:col-span-2 flex items-center justify-center hover:bg-[#d66b1c]">
                      <Plus className="h-4 w-4 mr-2" /> Add Variant
                    </button>
                  </form>
                </div>

                {/* Variants List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Variant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {variants.map(variant => (
                        <tr key={variant.id}>
                          {editingVariantId === variant.id ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input type="text" className="border p-2 rounded w-full" value={editVariantForm.title} onChange={e => setEditVariantForm({ ...editVariantForm, title: e.target.value })} required placeholder="Variant Title" />
                                <div className="border p-2 rounded w-full mt-2 flex items-center bg-white">
                                  <span className="text-xs text-slate-500 mr-2">New Images:</span>
                                  <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e, '', val => setEditVariantForm({...editVariantForm, image_url: val}))} className="text-xs w-full" />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input type="text" className="border p-2 rounded w-full" value={editVariantForm.price} onChange={e => setEditVariantForm({ ...editVariantForm, price: e.target.value })} placeholder="Price (e.g., ₹15)" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => saveEditVariant(variant.id)} className="text-green-600 hover:text-green-900 mr-4">
                                  Save
                                </button>
                                <button onClick={() => setEditingVariantId(null)} className="text-slate-600 hover:text-slate-900">
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {variant.image_url && variant.image_url.split(',').filter(Boolean).length > 0 ? (
                                    <div className="flex -space-x-4 mr-4">
                                      {variant.image_url.split(',').filter(Boolean).slice(0, 3).map((imgUrl: string, idx: number) => (
                                        <img key={idx} className="h-10 w-10 rounded-md object-cover border-2 border-white relative z-10" src={imgUrl.trim() || undefined} alt="" referrerPolicy="no-referrer" />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-slate-200 mr-4 flex items-center justify-center text-slate-400">img</div>
                                  )}
                                  <div className="text-sm font-medium text-slate-900 ml-2">{variant.title}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{variant.price || 'Same as product'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => startEditVariant(variant)} className="text-[#F27C21] hover:text-[#d66b1c] mr-4">
                                  Edit
                                </button>
                                <button onClick={() => deleteVariant(variant.id)} className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-5 w-5 inline" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {variants.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                            No variants added yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
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
                <button type="submit" className="bg-[#F27C21] text-white px-4 py-2 rounded md:col-span-2 flex items-center justify-center hover:bg-[#d66b1c]">
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
