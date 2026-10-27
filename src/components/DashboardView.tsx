import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  Search, 
  FileText, 
  Plus, 
  Filter, 
  ExternalLink
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { Shipment, ShipmentStatus } from '../types';
import { WaybillModal } from './WaybillModal';
import { ActiveTab } from './Navbar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { shipments, setSelectedShipment, selectShipmentByTracking } = useCourier();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [printingShipment, setPrintingShipment] = useState<Shipment | null>(null);

  // Metrics computation
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'SORTING_HUB').length;
  const outForDeliveryCount = shipments.filter(s => s.status === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = shipments.filter(s => s.status === 'DELIVERED').length;
  const delayedCount = shipments.filter(s => s.status === 'DELAYED').length;

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchesSearch = 
      searchFilter === '' ||
      s.trackingNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.senderName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.senderCity.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.receiverCity.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleTrackAction = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setActiveTab('tracking');
  };

  const handleUpdateAction = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setActiveTab('updates');
  };

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'OUT_FOR_DELIVERY':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'IN_TRANSIT':
      case 'SORTING_HUB':
        return 'text-blue-400 bg-blue-950/60 border-blue-800/60';
      case 'DELAYED':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      default:
        return 'text-slate-300 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>QuickTrack Hub &amp; Express Operations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            India's trusted express logistics network &middot; Real-time shipment tracking, hub scanning, and consignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('booking')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Book Docket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Shipments</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalShipments}</p>
          <p className="text-[10px] text-slate-400 mt-1">Consignments booked</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-medium">In Transit</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">{inTransitCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Cross-hub linehaul</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium">Out for Delivery</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{outForDeliveryCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Last-mile vans active</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{deliveredCount}</p>
          <p className="text-[10px] text-emerald-500 mt-1 font-mono">100% Verified POD</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium">Delayed / Held</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{delayedCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Requires re-dispatch</p>
        </div>
      </div>

      {/* Main Shipments Table Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by tracking #, customer, city..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-md focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Status Tabs (Interactive buttons) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'OUT_FOR_DELIVERY', 'IN_TRANSIT', 'DELIVERED', 'DELAYED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === st
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Shipper / Consignee</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Scheduled ETA</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No shipments match current criteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr 
                    key={s.trackingNumber} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      <button
                        onClick={() => handleTrackAction(s)}
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{s.trackingNumber}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                        <span>{s.senderCity}</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="font-semibold text-white">{s.receiverCity}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {s.weightKg} kg &middot; {s.packageType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-medium">{s.receiverName}</p>
                      <p className="text-[10px] text-slate-400">From: {s.senderName}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">
                        {s.serviceType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        ₹{s.shippingFee.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusColor(s.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {s.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                        {s.checkpoints.length} nodes in LinkedList
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {new Date(s.estimatedDeliveryDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTrackAction(s)}
                          title="Track & View Checkpoint Timeline"
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                        >
                          Track
                        </button>
                        <button
                          onClick={() => handleUpdateAction(s)}
                          title="Update Status & Facility Scan"
                          className="px-2 py-1 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setPrintingShipment(s)}
                          title="Print Waybill / Consignment Note"
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Waybill Modal */}
      {printingShipment && (
        <WaybillModal
          shipment={printingShipment}
          onClose={() => setPrintingShipment(null)}
        />
      )}
    </div>
  );
};
