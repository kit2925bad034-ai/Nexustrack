import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  User, 
  Phone, 
  Layers, 
  Share2,
  Check
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { Shipment, Checkpoint } from '../types';
import { WaybillModal } from './WaybillModal';
import { ActiveTab } from './Navbar';

interface TrackingViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ setActiveTab }) => {
  const { 
    shipments, 
    selectedShipment, 
    setSelectedShipment, 
    selectShipmentByTracking, 
    rollbackLastCheckpoint,
    getDoublyLinkedListForShipment
  } = useCourier();

  const [inputQuery, setInputQuery] = useState(selectedShipment?.trackingNumber || '');
  const [showWaybill, setShowWaybill] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(
    (selectedShipment?.checkpoints.length || 1) - 1
  );

  const currentShipment: Shipment | undefined = selectedShipment || shipments[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const ok = selectShipmentByTracking(inputQuery.trim());
    if (!ok) {
      alert(`No shipment found matching tracking ID: "${inputQuery}"`);
    } else {
      setActiveNodeIndex(0);
    }
  };

  const handleCopyTracking = () => {
    if (currentShipment) {
      navigator.clipboard.writeText(currentShipment.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRollback = () => {
    if (!currentShipment) return;
    if (currentShipment.checkpoints.length <= 1) {
      alert('Cannot rollback: shipment only has its origin booking checkpoint.');
      return;
    }
    const confirmed = window.confirm(`Rollback checkpoint from Doubly LinkedList for ${currentShipment.trackingNumber}?`);
    if (confirmed) {
      rollbackLastCheckpoint(currentShipment.trackingNumber);
    }
  };

  // Get Doubly LinkedList visual representation for current shipment
  const dlist = currentShipment ? getDoublyLinkedListForShipment(currentShipment.trackingNumber) : undefined;
  const visualNodes = dlist ? dlist.getVisualNodes() : [];

  return (
    <div className="space-y-6">
      {/* Top Search & Sample Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter QuickTrack Docket / AWB Number (e.g. QT-8921-4091)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 text-slate-100 border border-slate-700 rounded-lg focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Docket</span>
          </button>
        </form>

        {/* Quick Click Sample IDs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Popular QuickTrack Dockets:</span>
          {shipments.slice(0, 4).map((s) => (
            <button
              key={s.trackingNumber}
              onClick={() => {
                setInputQuery(s.trackingNumber);
                selectShipmentByTracking(s.trackingNumber);
              }}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                currentShipment?.trackingNumber === s.trackingNumber
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s.trackingNumber} ({s.status.replace(/_/g, ' ')})
            </button>
          ))}
        </div>
      </div>

      {currentShipment ? (
        <div className="space-y-6">
          {/* Main Shipment Status Card */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black tracking-tight text-white font-mono">
                    {currentShipment.trackingNumber}
                  </h2>
                  <button
                    onClick={handleCopyTracking}
                    title="Copy tracking number"
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    {currentShipment.serviceType.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Booked on {new Date(currentShipment.bookingDate).toLocaleString()} &middot; Priority: {currentShipment.priority}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowWaybill(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors border border-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Airway Bill / Label</span>
                </button>
                <button
                  onClick={() => setActiveTab('updates')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors"
                >
                  <span>Update Status</span>
                </button>
              </div>
            </div>

            {/* Route & ETA Milestone Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-slate-950/60 rounded-lg border border-slate-800/80">
              {/* Origin */}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Origin Shipper</span>
                <p className="text-base font-bold text-white mt-0.5">{currentShipment.senderCity}</p>
                <p className="text-xs text-slate-400">{currentShipment.senderName}</p>
                <p className="text-[11px] text-slate-500">{currentShipment.senderAddress}</p>
              </div>

              {/* Progress Line */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-full flex items-center justify-center gap-2 mb-2">
                  <div className="h-1 flex-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded" />
                  <Truck className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div className={`h-1 flex-1 rounded ${currentShipment.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                  {currentShipment.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {currentShipment.status === 'DELIVERED'
                    ? `Delivered on ${new Date(currentShipment.deliveredDate || currentShipment.estimatedDeliveryDate).toLocaleDateString()}`
                    : `Est. Delivery: ${new Date(currentShipment.estimatedDeliveryDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>

              {/* Destination */}
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Consignee Destination</span>
                <p className="text-base font-bold text-white mt-0.5">{currentShipment.receiverCity}</p>
                <p className="text-xs text-slate-400">{currentShipment.receiverName}</p>
                <p className="text-[11px] text-slate-500">{currentShipment.receiverAddress}</p>
              </div>
            </div>

            {/* Courier Driver Card if Assigned */}
            {currentShipment.assignedCourier && (
              <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Assigned Courier: {currentShipment.assignedCourier.name}</span>
                    <p className="text-slate-400 text-[11px]">
                      Badge: {currentShipment.assignedCourier.badgeNumber} &middot; Vehicle: {currentShipment.assignedCourier.vehiclePlate} &middot; Station: {currentShipment.assignedCourier.hubLocation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${currentShipment.assignedCourier.phone}`}
                    className="flex items-center gap-1 px-2.5 py-1 text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{currentShipment.assignedCourier.phone}</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Doubly LinkedList Checkpoint Timeline */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Live Checkpoint Transit History
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleRollback}
                  className="flex items-center gap-1 px-2.5 py-1 text-rose-400 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/50 rounded transition-colors"
                  title="Undo the last milestone checkpoint"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rollback Last Checkpoint</span>
                </button>
              </div>
            </div>

            {/* Visual Node Chain */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800 font-sans">
              {currentShipment.checkpoints.map((cp, idx) => {
                const isLatest = idx === currentShipment.checkpoints.length - 1;
                const isOrigin = idx === 0;

                return (
                  <div key={cp.id} className="relative group">
                    {/* Node Dot / Indicator */}
                    <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      isLatest
                        ? 'bg-amber-500 border-amber-300 text-slate-950 ring-4 ring-amber-500/20'
                        : isOrigin
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300'
                    }`}>
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    </div>

                    {/* Node Card */}
                    <div className={`p-4 rounded-lg border transition-all ${
                      isLatest
                        ? 'bg-slate-950/90 border-amber-500/40 shadow-md'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {cp.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-400">&middot;</span>
                          <span className="font-medium text-amber-400">{cp.facility}</span>
                          <span className="text-slate-500">({cp.city})</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {new Date(cp.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-2">{cp.description}</p>

                      {/* LinkedList Pointer Metadata footer */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                        <span className="text-slate-400">Node ID: {cp.id}</span>
                        <span>&middot;</span>
                        <span>Prev Node: {idx > 0 ? currentShipment.checkpoints[idx - 1].id : 'NULL (HEAD)'}</span>
                        <span>&middot;</span>
                        <span>Next Node: {idx < currentShipment.checkpoints.length - 1 ? currentShipment.checkpoints[idx + 1].id : 'NULL (TAIL)'}</span>
                        <span>&middot;</span>
                        <span>Operator: {cp.operatorId}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
          <p>No shipment selected. Search a tracking number above.</p>
        </div>
      )}

      {/* Modal */}
      {showWaybill && currentShipment && (
        <WaybillModal
          shipment={currentShipment}
          onClose={() => setShowWaybill(false)}
        />
      )}
    </div>
  );
};
