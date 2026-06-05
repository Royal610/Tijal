import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import PrintingBackgroundEffects from './components/PrintingBackgroundEffects';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ProductDetails from './pages/ProductDetails';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function GlobalEffects() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <PrintingBackgroundEffects />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GlobalEffects />
      <div className="flex flex-col min-h-screen bg-transparent font-sans text-slate-900 relative">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ProductDetails />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}
