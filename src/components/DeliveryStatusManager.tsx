import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  AlertCircle, 
  Clock, 
  Send, 
  Layers, 
  ArrowRight
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { ShipmentStatus } from '../types';
import { ActiveTab } from './Navbar';

interface DeliveryStatusManagerProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DeliveryStatusManager: React.FC<DeliveryStatusManagerProps> = ({ setActiveTab }) => {
  const { 
    shipments, 
    selectedShipment, 
    setSelectedShipment, 
    updateShipmentStatus
  } = useCourier();

  const [targetTracking, setTargetTracking] = useState(selectedShipment?.trackingNumber || shipments[0]?.trackingNumber || '');
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>('IN_TRANSIT');
  const [facility, setFacility] = useState('QuickTrack Chennai Koyambedu Main Hub');
  const [city, setCity] = useState('Chennai');
  const [operatorId, setOperatorId] = useState('OPR-CHN-8841');
  const [remarks, setRemarks] = useState('Docket unloaded, barcode scan verified, sorted for onward destination hub at Chennai Main Hub.');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentShipment = shipments.find(s => s.trackingNumber === targetTracking) || shipments[0];

  const handleSelectShipment = (trackingNo: string) => {
    setTargetTracking(trackingNo);
    const s = shipments.find(item => item.trackingNumber === trackingNo);
    if (s) {
      setSelectedShipment(s);
      setCity(s.receiverCity);
    }
  };

  const handleApplyUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShipment) return;

    const success = updateShipmentStatus(
      currentShipment.trackingNumber,
      selectedStatus,
      facility,
      city,
      remarks,
      operatorId
    );

    if (success) {
      setSuccessMessage(`Status updated to "${selectedStatus}" for ${currentShipment.trackingNumber}! Milestone checkpoint recorded successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const statusPresets: Array<{ status: ShipmentStatus; label: string; icon: any; defaultRemarks: string }> = [
    { 
      status: 'PICKED_UP', 
      label: 'Picked Up', 
      icon: Clock, 
      defaultRemarks: 'Package physically picked up from shipper address by courier agent.' 
    },
    { 
      status: 'SORTING_HUB', 
      label: 'Sorting Hub', 
      icon: RefreshCw, 
      defaultRemarks: 'Arrived at central automated sortation facility. Scan verified.' 
    },
    { 
      status: 'IN_TRANSIT', 
      label: 'In Transit', 
      icon: Truck, 
      defaultRemarks: 'Consolidated into linehaul container and departed for destination city.' 
    },
    { 
      status: 'OUT_FOR_DELIVERY', 
      label: 'Out for Delivery', 
      icon: MapPin, 
      defaultRemarks: 'Package transferred to local delivery van for final mile drop-off.' 
    },
    { 
      status: 'DELIVERED', 
      label: 'Delivered', 
      icon: CheckCircle2, 
      defaultRemarks: 'Delivered successfully to recipient. Direct signature captured on handheld terminal.' 
    },
    { 
      status: 'DELAYED', 
      label: 'Delayed / Hold', 
      icon: AlertCircle, 
      defaultRemarks: 'Held temporarily due to adverse weather or transit route inspection.' 
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-500" />
            <span>Delivery Status &amp; Hub Scanner Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch scan terminal: scan inbound or outbound dockets to log milestone events and update real-time parcel transit status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tracking')}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
          >
            Track Current Package &rarr;
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Shipment Selection & Current Status */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Select Active Shipment
            </label>
            <select
              value={targetTracking}
              onChange={(e) => handleSelectShipment(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-md text-amber-400 font-mono focus:outline-none focus:border-amber-500"
            >
              {shipments.map(s => (
                <option key={s.trackingNumber} value={s.trackingNumber}>
                  {s.trackingNumber} &middot; {s.senderCity} &rarr; {s.receiverCity} ({s.status})
                </option>
              ))}
            </select>

            {currentShipment && (
              <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-xs space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-bold text-amber-400">{currentShipment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="text-slate-200">{currentShipment.senderCity} &rarr; {currentShipment.receiverCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Consignee:</span>
                  <span className="text-slate-200">{currentShipment.receiverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Checkpoints Logged:</span>
                  <span className="font-mono text-white">{currentShipment.checkpoints.length} nodes</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets for Status Transition */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Quick Status Presets
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {statusPresets.map(preset => {
                const Icon = preset.icon;
                const isSelected = selectedStatus === preset.status;
                return (
                  <button
                    key={preset.status}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(preset.status);
                      setRemarks(preset.defaultRemarks);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Form & Status Updates */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleApplyUpdate} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>3. Facility Checkpoint Details &amp; Operator Log</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Scanning Facility / Hub *</label>
                <input
                  type="text"
                  required
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">City Location *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Scan Operator ID</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ShipmentStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="SORTING_HUB">SORTING_HUB</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="DELAYED">DELAYED</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 font-medium mb-1">Scan Remarks / Checkpoint Log Description</label>
              <textarea
                rows={3}
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Modifies Doubly LinkedList tail pointer</span>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow-md shadow-red-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Commit Checkpoint &amp; Update Status</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
