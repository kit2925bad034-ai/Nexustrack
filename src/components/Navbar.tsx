import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  LayoutDashboard, 
  Route, 
  RefreshCw, 
  Users, 
  Menu, 
  X, 
  PhoneCall, 
  MapPin 
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { BranchLocatorModal } from './BranchLocatorModal';

export type ActiveTab = 'dashboard' | 'booking' | 'tracking' | 'updates' | 'customers';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { selectShipmentByTracking } = useCourier();
  const [quickTrackQuery, setQuickTrackQuery] = useState('');
  const [trackError, setTrackError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBranchLocator, setShowBranchLocator] = useState(false);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackQuery.trim()) return;

    const found = selectShipmentByTracking(quickTrackQuery.trim());
    if (found) {
      setTrackError(false);
      setActiveTab('tracking');
      setQuickTrackQuery('');
      setMobileMenuOpen(false);
    } else {
      setTrackError(true);
      setTimeout(() => setTrackError(false), 2500);
    }
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'booking' as ActiveTab, label: 'Book Docket', icon: PlusCircle },
    { id: 'tracking' as ActiveTab, label: 'Track Docket', icon: Route },
    { id: 'updates' as ActiveTab, label: 'Hub Scanner', icon: RefreshCw },
    { id: 'customers' as ActiveTab, label: 'Clients', icon: Users },
  ];

  return (
    <>
      {/* Top Customer Care & Helpline Strip (QuickTrack Signature Bar) */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white text-[11px] py-1.5 px-4 border-b border-red-600/40 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <PhoneCall className="w-3 h-3 text-amber-300" />
              <span>Toll-Free: 1800 208 8888</span>
            </span>
            <span className="hidden md:inline text-red-200/60">|</span>
            <span className="hidden md:inline text-red-100">
              care@quicktrack.in &middot; 2,700+ Hubs &amp; Branches Across India
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBranchLocator(true)}
              className="flex items-center gap-1 text-white hover:text-amber-300 transition-colors font-medium underline underline-offset-2"
            >
              <MapPin className="w-3 h-3 text-amber-300" />
              <span>Branch Locator</span>
            </button>
            <span className="text-red-200/60">|</span>
            <span className="text-amber-200 font-medium italic hidden sm:inline">
              "Delivering Express Logistics Across The Nation"
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* QuickTrack Brand Logo */}
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
            >
              {/* QT Emblem Badge */}
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center text-white shadow-lg border border-red-500/40 group-hover:scale-105 transition-transform">
                  <span className="font-black text-lg tracking-tighter">QT</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-950">
                  ★
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-white group-hover:text-red-400 transition-colors font-sans">
                    <span className="text-red-500">QUICK</span>TRACK
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="QuickTrack Network Online" />
                </div>
                <p className="text-[10px] text-amber-400 tracking-wider font-semibold uppercase">
                  India's Trusted Express &amp; Logistics Network
                </p>
              </div>
            </div>

            {/* Quick Docket Track Input (Desktop) */}
            <form onSubmit={handleQuickTrack} className="hidden md:flex items-center flex-1 max-w-sm mx-2">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Docket / AWB No (e.g. QT-8921-4091)..."
                  value={quickTrackQuery}
                  onChange={(e) => setQuickTrackQuery(e.target.value)}
                  className={`w-full pl-9 pr-14 py-1.5 text-xs bg-slate-950/70 text-slate-200 border rounded-lg focus:outline-none transition-all placeholder:text-slate-500 font-mono ${
                    trackError 
                      ? 'border-red-500 ring-1 ring-red-500/50' 
                      : 'border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-0.5 text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  Track
                </button>
              </div>
            </form>

            {/* Nav Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-500'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu & Quick Action Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setActiveTab('booking')}
                className="p-2 text-xs font-semibold bg-red-600 text-white rounded-md"
                title="Book Docket"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-800 space-y-2">
              <form onSubmit={handleQuickTrack} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Docket number (e.g. QT-8921-4091)..."
                    value={quickTrackQuery}
                    onChange={(e) => setQuickTrackQuery(e.target.value)}
                    className="w-full pl-9 pr-14 py-2 text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-md focus:outline-none font-mono"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded"
                  >
                    Track
                  </button>
                </div>
              </form>
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md text-left ${
                        isActive
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Branch Locator Modal */}
      {showBranchLocator && (
        <BranchLocatorModal onClose={() => setShowBranchLocator(false)} />
      )}
    </>
  );
};
