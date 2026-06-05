import React, { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, LayoutDashboard, MessageSquare, Users, Settings, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [require2fa, setRequire2fa] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'testimonials' | 'inquiries' | 'directors' | 'clients' | 'about' | 'site_settings' | 'newsletter' | 'security'>('dashboard');
  const [dashboardStats, setDashboardStats] = useState({ totalProducts: 0, bulkInquiries: 0, totalInquiries: 0 });
  const [setup2faInfo, setSetup2faInfo] = useState<{qrCodeUrl: string, secret: string, alreadyEnabled?: boolean} | null>(null);

  const [setupToken, setSetupToken] = useState('');
  const [loading, setLoading] = useState(true);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to jpeg for smaller size
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, type: 'director' | 'client' | 'service' | 'variant' | 'setting' = 'service') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setSaveStatus('Processing image...');
      const base64 = await convertToBase64(files[0]);
      setter(base64);
      setSaveStatus('Image attached!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('Error attaching image');
    }
  };

  // Data states
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [aboutCounters, setAboutCounters] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState({ 
    facebook_url: '', 
    instagram_url: '', 
    twitter_url: '',
    home_hero_image: '',
    about_hero_image: ''
  });
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Form states
  const [newService, setNewService] = useState({ title: '', description: '', image_url: '', category: '', price: '' });
  const [newTestimonial, setNewTestimonial] = useState({ client_name: '', content: '', rating: 5 });
  const [newClient, setNewClient] = useState({ name: '', image_url: '', description: '', website: '' });
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [editClientForm, setEditClientForm] = useState({ name: '', image_url: '', description: '', website: '' });

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
      fetch('/api/inquiries/unread-count').then(r => r.json()).then(data => setUnreadCount(data.count)).catch(console.error);
      fetchData();

      // Poll for unread count
      const interval = setInterval(() => {
        fetch('/api/inquiries/unread-count').then(r => r.json()).then(data => setUnreadCount(data.count)).catch(console.error);
      }, 30000);
      return () => clearInterval(interval);
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
      } else if (activeTab === 'about') {
        const res = await fetch('/api/about-counters');
        const data = await res.json();
        if (Array.isArray(data)) setAboutCounters(data);
      } else if (activeTab === 'directors') {
        const res = await fetch('/api/directors');
        const data = await res.json();
        if (Array.isArray(data)) setDirectors(data);
      } else if (activeTab === 'clients') {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (Array.isArray(data)) setClients(data);
      } else if (activeTab === 'site_settings') {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSiteSettings(data);
      } else if (activeTab === 'newsletter') {
        const res = await fetch('/api/newsletter/subscribers');
        const data = await res.json();
        if (Array.isArray(data)) setSubscribers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAboutCounterChange = (index: number, field: string, value: string) => {
    const newCounters = [...aboutCounters];
    newCounters[index][field] = value;
    setAboutCounters(newCounters);
  };

  const saveAboutCounters = async () => {
    try {
      setSaveStatus('Saving...');
      const res = await fetch('/api/about-counters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutCounters)
      });
      if (res.ok) {
        setSaveStatus('Saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Failed to save');
      }
    } catch (err) {
      setSaveStatus('Error saving');
    }
  };

  const handleDirectorChange = (index: number, field: string, value: string) => {
    const newDirectors = [...directors];
    newDirectors[index][field] = value;
    setDirectors(newDirectors);
  };

  const saveDirectors = async () => {
    try {
      setSaveStatus('Saving directors...');
      const res = await fetch('/api/directors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directors)
      });
      if (res.ok) {
        setSaveStatus('Directors saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Failed to save directors');
      }
    } catch (err) {
      setSaveStatus('Error saving directors');
    }
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      setNewClient({ name: '', image_url: '', description: '', website: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteClient = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditClient = (client: any) => {
    setEditingClientId(client.id);
    setEditClientForm({
      name: client.name || '',
      image_url: client.image_url || '',
      description: client.description || '',
      website: client.website || ''
    });
  };

  const saveEditClient = async (id: number) => {
    try {
      setSaveStatus('Updating client...');
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClientForm)
      });
      if (res.ok) {
        setEditingClientId(null);
        setSaveStatus('Client updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error updating client');
    }
  };

  const saveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus('Saving settings...');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) {
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error saving settings');
    }
  };

  const deleteSubscriber = async (id: number) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      const res = await fetch(`/api/newsletter/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
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

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/inquiries/${id}/read`, { method: 'PUT' });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, is_read: 1 } : inq));
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
                  maxLength={50}
                  pattern="^[a-zA-Z0-9_\-]+$"
                  title="Username must contain only alphanumeric characters, underscores, or hyphens."
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
                  maxLength={100}
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
                      <img src={setup2faInfo.qrCodeUrl || undefined} alt="2FA QR Code" className="w-40 h-40 border rounded-lg shadow-sm mb-2" />
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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === 'inquiries' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center">
              <MessageSquare className="mr-3 h-5 w-5" /> Inquiries
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'about' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> About Counters
          </button>
          <button
            onClick={() => setActiveTab('directors')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'directors' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <Users className="mr-3 h-5 w-5" /> Manage Directors
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'clients' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <Users className="mr-3 h-5 w-5" /> Manage Clients
          </button>
          <button
            onClick={() => setActiveTab('site_settings')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'site_settings' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <Settings className="mr-3 h-5 w-5" /> Site Settings
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'newsletter' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <MessageSquare className="mr-3 h-5 w-5" /> Newsletter
          </button>
          <button
            onClick={() => { setActiveTab('security'); setup2fa(); }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-[#F27C21]' : 'hover:bg-slate-800'}`}
          >
            <Shield className="mr-3 h-5 w-5" /> Security (2FA)
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

        {/* About Counters Tab */}
        {activeTab === 'about' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">About Page Counters</h2>
              {saveStatus && (
                <span className={`text-sm font-medium px-4 py-2 rounded ${saveStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {saveStatus}
                </span>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-slate-600 mb-6">Update the statistics that appear on the About Us page.</p>
              <div className="space-y-6">
                {aboutCounters.map((counter, index) => (
                  <div key={counter.id || index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 last:border-0">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{counter.key_name || 'Label'}</label>
                      <input 
                        type="text" 
                        value={counter.label || ''} 
                        onChange={(e) => handleAboutCounterChange(index, 'label', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#F27C21]"
                        placeholder="Label (e.g., Happy Clients)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                      <input 
                        type="text" 
                        value={counter.value || ''} 
                        onChange={(e) => handleAboutCounterChange(index, 'value', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#F27C21]"
                        placeholder="Value (e.g., 5,000+)"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button 
                  onClick={saveAboutCounters}
                  className="bg-[#F27C21] hover:bg-[#d66b1c] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Directors Management Tab */}
        {activeTab === 'directors' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Manage Directors</h2>
              {saveStatus && (
                <span className={`text-sm font-medium px-4 py-2 rounded ${saveStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {saveStatus}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {directors.map((director, index) => (
                <div key={director.id || index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Director {index + 1}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input 
                        type="text" 
                        value={director.name || ''} 
                        onChange={(e) => handleDirectorChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#F27C21]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role/Title</label>
                      <input 
                        type="text" 
                        value={director.role || ''} 
                        onChange={(e) => handleDirectorChange(index, 'role', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#F27C21]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Director Image</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => handleDirectorChange(index, 'image_url', url), 'director')}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F27C21]/10 file:text-[#F27C21] hover:file:bg-[#F27C21]/20"
                          />
                        </div>
                        {director.image_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border">
                            <img src={director.image_url || undefined} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Brief Bio</label>
                      <textarea 
                        value={director.bio || ''} 
                        onChange={(e) => handleDirectorChange(index, 'bio', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#F27C21] h-24"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <button 
                onClick={saveDirectors}
                className="bg-[#F27C21] hover:bg-[#d66b1c] text-white px-10 py-3 rounded-lg font-bold transition-colors shadow-md"
              >
                Save All Director Changes
              </button>
            </div>
          </div>
        )}

        {/* Clients Management Tab */}
        {activeTab === 'clients' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Our Clients</h2>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-[#F27C21]">Add New Client</h3>
              <form onSubmit={addClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Client Name" 
                  className="px-4 py-2 border rounded-lg" 
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Website URL" 
                  className="px-4 py-2 border rounded-lg" 
                  value={newClient.website}
                  onChange={(e) => setNewClient({...newClient, website: e.target.value})}
                />
                <div className="border p-2 rounded flex items-center justify-between">
                  <span className="text-sm text-slate-500 mr-2">Client Logo:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, (url) => setNewClient({...newClient, image_url: url}), 'client')} 
                    className="text-sm" 
                  />
                </div>
                {newClient.image_url && (
                  <div className="md:col-span-2 flex items-center space-x-2">
                    <span className="text-xs text-green-600 font-medium">Image attached:</span>
                    <div className="w-10 h-10 border rounded overflow-hidden">
                      <img src={newClient.image_url || undefined} alt="Attached" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
                <textarea 
                  placeholder="Short Description" 
                  className="px-4 py-2 border rounded-lg md:col-span-2" 
                  value={newClient.description}
                  onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                />
                <button 
                  type="submit" 
                  className="bg-[#F27C21] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#d66b1c] transition-colors md:w-fit"
                >
                  Add Client
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  {editingClientId === client.id ? (
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={editClientForm.name} 
                        onChange={e => setEditClientForm({...editClientForm, name: e.target.value})}
                        className="w-full px-3 py-1 border rounded text-sm"
                        placeholder="Name"
                      />
                      <input 
                        type="text" 
                        value={editClientForm.website} 
                        onChange={e => setEditClientForm({...editClientForm, website: e.target.value})}
                        className="w-full px-3 py-1 border rounded text-sm"
                        placeholder="Website"
                      />
                      <div className="flex items-center space-x-2">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, (url) => setEditClientForm({...editClientForm, image_url: url}), 'client')}
                          className="text-xs flex-1"
                        />
                        {editClientForm.image_url && (
                          <img src={editClientForm.image_url} alt="Preview" className="w-8 h-8 object-contain border" />
                        )}
                      </div>
                      <textarea 
                        value={editClientForm.description} 
                        onChange={e => setEditClientForm({...editClientForm, description: e.target.value})}
                        className="w-full px-3 py-1 border rounded text-sm h-20"
                        placeholder="Description"
                      />
                      <div className="flex space-x-2">
                        <button onClick={() => saveEditClient(client.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Save</button>
                        <button onClick={() => setEditingClientId(null)} className="bg-slate-500 text-white px-3 py-1 rounded text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border bg-slate-50 flex items-center justify-center">
                          {client.image_url ? (
                            <img src={client.image_url || undefined} alt={client.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="text-slate-300 font-bold">Logo</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800">{client.name}</h4>
                          {client.website && <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{client.website}</a>}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3">{client.description}</p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t">
                        <button 
                          onClick={() => startEditClient(client)}
                          className="text-blue-500 text-sm font-medium hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteClient(client.id)}
                          className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Site Settings Tab */}
        {activeTab === 'site_settings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Site Settings</h2>
              {saveStatus && (
                <span className={`text-sm font-medium px-4 py-2 rounded ${saveStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {saveStatus}
                </span>
              )}
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
              <p className="text-slate-600 mb-8">Configure your business social media presence. These links will appear in the footer across the entire website.</p>
              
              <form onSubmit={saveSiteSettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Facebook URL</label>
                  <input 
                    type="url" 
                    value={siteSettings.facebook_url}
                    onChange={(e) => setSiteSettings({...siteSettings, facebook_url: e.target.value})}
                    placeholder="https://facebook.com/your-page"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F27C21] focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Instagram URL</label>
                  <input 
                    type="url" 
                    value={siteSettings.instagram_url}
                    onChange={(e) => setSiteSettings({...siteSettings, instagram_url: e.target.value})}
                    placeholder="https://instagram.com/your-handle"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F27C21] focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Twitter URL</label>
                  <input 
                    type="url" 
                    value={siteSettings.twitter_url}
                    onChange={(e) => setSiteSettings({...siteSettings, twitter_url: e.target.value})}
                    placeholder="https://twitter.com/your-handle"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F27C21] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Page Headers</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Home Hero Image</label>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex-1">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => setSiteSettings({...siteSettings, home_hero_image: url}), 'setting')}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F27C21]/10 file:text-[#F27C21] hover:file:bg-[#F27C21]/20"
                          />
                        </div>
                        {siteSettings.home_hero_image && (
                          <div className="w-20 h-12 rounded overflow-hidden border">
                            <img src={siteSettings.home_hero_image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">About Hero Image</label>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex-1">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => setSiteSettings({...siteSettings, about_hero_image: url}), 'setting')}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F27C21]/10 file:text-[#F27C21] hover:file:bg-[#F27C21]/20"
                          />
                        </div>
                        {siteSettings.about_hero_image && (
                          <div className="w-20 h-12 rounded overflow-hidden border">
                            <img src={siteSettings.about_hero_image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#F27C21] text-white py-4 rounded-xl font-bold hover:bg-[#d66b1c] transition-all shadow-lg shadow-[#F27C21]/20 active:scale-[0.98]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Newsletter Subscribers</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subscribed Date</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-500 italic">No subscribers yet.</td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{sub.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button 
                            onClick={() => deleteSubscriber(sub.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security / 2FA Tab */}
        {activeTab === 'security' && (
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
                      <input type="file" accept="image/*" required onChange={e => handleImageUpload(e, val => setNewService({...newService, image_url: val}), 'service')} className="text-sm" />
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
                      {services.map((service, idx) => (
                        <tr key={`adm-srv-${service.id || idx}`} className="cursor-pointer hover:bg-slate-50" onClick={() => viewVariants(service.id)}>
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
                      <span className="text-sm text-slate-500 mr-2">Variant Image:</span>
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, val => setNewVariant({...newVariant, image_url: val}), 'variant')} className="text-sm" />
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
                      {variants.map((variant, idx) => (
                        <tr key={`adm-var-${variant.id || idx}`}>
                          {editingVariantId === variant.id ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input type="text" className="border p-2 rounded w-full" value={editVariantForm.title} onChange={e => setEditVariantForm({ ...editVariantForm, title: e.target.value })} required placeholder="Variant Title" />
                                <div className="border p-2 rounded w-full mt-2 flex items-center bg-white">
                                  <span className="text-xs text-slate-500 mr-2">New Image:</span>
                                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, val => setEditVariantForm({...editVariantForm, image_url: val}), 'variant')} className="text-xs w-full" />
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
                                    <img className="h-10 w-10 rounded-md object-cover relative z-10" src={variant.image_url.split(',')[0].trim() || undefined} alt="" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-slate-200 flex items-center justify-center text-slate-400">img</div>
                                  )}
                                  <div className="text-sm font-medium text-slate-900 ml-4">{variant.title}</div>
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
                    <tr 
                      key={inq.id} 
                      className={`hover:bg-slate-50 transition-colors ${!inq.is_read ? 'bg-orange-50/50' : ''}`}
                      onMouseEnter={() => {
                        if (!inq.is_read) markAsRead(inq.id);
                      }}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${!inq.is_read ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        {new Date(inq.created_at).toLocaleDateString()}
                        {!inq.is_read && <span className="ml-2 inline-block w-2 h-2 bg-brand-primary rounded-full" />}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${!inq.is_read ? 'font-black text-slate-900' : 'font-medium text-slate-900'}`}>{inq.name}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${!inq.is_read ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        <div>{inq.email}</div>
                        <div>{inq.phone}</div>
                      </td>
                      <td className={`px-6 py-4 text-sm max-w-xs truncate ${!inq.is_read ? 'font-bold text-slate-900' : 'text-slate-500'}`} title={inq.message}>
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
