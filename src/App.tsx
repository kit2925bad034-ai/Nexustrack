import React, { useState } from 'react';
import { CourierProvider } from './context/CourierContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BookingView } from './components/BookingView';
import { TrackingView } from './components/TrackingView';
import { DeliveryStatusManager } from './components/DeliveryStatusManager';
import { CustomerDirectoryView } from './components/CustomerDirectoryView';
import { ShieldCheck, Truck, Headphones } from 'lucide-react';

function CourierApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'booking' && <BookingView setActiveTab={setActiveTab} />}
        {activeTab === 'tracking' && <TrackingView setActiveTab={setActiveTab} />}
        {activeTab === 'updates' && <DeliveryStatusManager setActiveTab={setActiveTab} />}
        {activeTab === 'customers' && <CustomerDirectoryView setActiveTab={setActiveTab} />}
      </main>

      {/* System Footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center font-black text-[10px] shadow">
              QT
            </div>
            <span className="font-semibold text-slate-300">QuickTrack Logistics Network</span>
            <span>&middot;</span>
            <span className="text-red-400 font-medium italic">Delivering Express Logistics Across The Nation</span>
          </div>

          {/* Logistics Trust Badges */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Insured Transit</span>
            </span>
            <span>&middot;</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>2,700+ Hubs Nationwide</span>
            </span>
            <span>&middot;</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Headphones className="w-3.5 h-3.5 text-red-400" />
              <span>Toll-Free 1800 208 8888</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CourierProvider>
      <CourierApp />
    </CourierProvider>
  );
}
