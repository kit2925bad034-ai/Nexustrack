import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  User, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  FileCheck, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { BookingFormData, ServiceType, PackageType, PriorityLevel, Shipment } from '../types';
import { WaybillModal } from './WaybillModal';
import { ActiveTab } from './Navbar';

interface BookingViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ setActiveTab }) => {
  const { customers, bookShipment } = useCourier();

  const [formData, setFormData] = useState<BookingFormData>({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    senderCity: 'Bengaluru',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    receiverCity: 'Mumbai',
    serviceType: 'EXPRESS_AIR',
    packageType: 'PARCEL',
    priority: 'HIGH',
    weightKg: 2.5,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 15,
    declaredValue: 15000,
    fragile: false,
    insurance: true,
    signatureRequired: true,
    notes: 'Urgent commercial consignment',
  });

  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);
  const [showWaybill, setShowWaybill] = useState(false);

  // Auto-fill sender from existing customer directory
  const handleSelectSender = (customerId: string) => {
    const cust = customers.find(c => c.customerId === customerId);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        senderName: cust.fullName,
        senderPhone: cust.phone,
        senderEmail: cust.email,
        senderAddress: cust.address,
        senderCity: cust.city,
      }));
    }
  };

  // Dimensional weight & dynamic rate calculation in INR (₹)
  const dimensionalWeight = Number(((formData.lengthCm * formData.widthCm * formData.heightCm) / 5000).toFixed(2));
  const billableWeight = Math.max(formData.weightKg, dimensionalWeight);
  const rateMultiplier = formData.serviceType === 'SAME_DAY' ? 450 : formData.serviceType === 'EXPRESS_AIR' ? 320 : formData.serviceType === 'PRIORITY_GROUND' ? 180 : 120;
  const estimatedRate = Number((billableWeight * rateMultiplier + (formData.insurance ? 250 : 0) + (formData.fragile ? 150 : 0)).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderName || !formData.receiverName || !formData.senderAddress || !formData.receiverAddress) {
      alert('Please fill in both sender and receiver full address details.');
      return;
    }

    const newShipment = bookShipment(formData);
    setCreatedShipment(newShipment);
    setShowWaybill(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-red-600 text-white font-black text-xs flex items-center justify-center shadow">
              QT
            </div>
            <span>QuickTrack Docket Booking &amp; Dispatch Wizard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate official QuickTrack Consignment Note (AWB), calculate dynamic dimensional rates, and schedule instant parcel dispatch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Rate Engine: Dynamic Dimensional Tier
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1 & 2: Sender & Receiver Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Shipper Information */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">1. Shipper / Origin (Sender)</h2>
              </div>
              {/* Customer autofill selector */}
              <select
                onChange={(e) => handleSelectSender(e.target.value)}
                defaultValue=""
                className="text-[11px] bg-slate-950 border border-slate-700 text-slate-300 rounded px-2 py-1 focus:outline-none"
              >
                <option value="" disabled>Autofill from Customers</option>
                {customers.map(c => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.fullName} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Sender Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Menon"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 11223"
                    value={formData.senderPhone}
                    onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rajesh.menon@infosys.com"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Pickup Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="44 Electronic City Phase 1, Hosur Road"
                  value={formData.senderAddress}
                  onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Origin City / Hub *</label>
                <select
                  value={formData.senderCity}
                  onChange={(e) => setFormData({ ...formData, senderCity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Bengaluru">Bengaluru (BLR Kempegowda Cargo Terminal)</option>
                  <option value="Mumbai">Mumbai (BOM Air Cargo &amp; Andheri Hub)</option>
                  <option value="New Delhi">New Delhi (DEL IGI Logistics Hub)</option>
                  <option value="Hyderabad">Hyderabad (HYD Rajiv Gandhi Cargo &amp; Hitec City)</option>
                  <option value="Chennai">Chennai (MAA Airport &amp; Guindy Depot)</option>
                  <option value="Pune">Pune (PNQ Intermodal Hub &amp; Hinjewadi)</option>
                  <option value="Kolkata">Kolkata (CCU Netaji Subhash Chandra Bose Hub)</option>
                  <option value="Ahmedabad">Ahmedabad (AMD Freight Complex)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consignee Information */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">2. Consignee / Destination (Receiver)</h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Final Mile</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Receiver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Iyer"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 44556"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="ananya.iyer@tcs.com"
                    value={formData.receiverEmail}
                    onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Delivery Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Fort House, 221 Dr. D.N. Road"
                  value={formData.receiverAddress}
                  onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Destination City *</label>
                <select
                  value={formData.receiverCity}
                  onChange={(e) => setFormData({ ...formData, receiverCity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Mumbai">Mumbai (BOM Air Cargo &amp; Andheri Hub)</option>
                  <option value="Bengaluru">Bengaluru (BLR Kempegowda Cargo Terminal)</option>
                  <option value="New Delhi">New Delhi (DEL IGI Logistics Hub)</option>
                  <option value="Hyderabad">Hyderabad (HYD Rajiv Gandhi Cargo &amp; Hitec City)</option>
                  <option value="Chennai">Chennai (MAA Airport &amp; Guindy Depot)</option>
                  <option value="Pune">Pune (PNQ Intermodal Hub &amp; Hinjewadi)</option>
                  <option value="Kolkata">Kolkata (CCU Netaji Subhash Chandra Bose Hub)</option>
                  <option value="Ahmedabad">Ahmedabad (AMD Freight Complex)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Package Specifications & Service Selection */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>3. Package Specifications &amp; Speed Tier</span>
            </h2>
            <span className="text-xs text-slate-400">Dimensions: L &times; W &times; H / 5000</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Actual Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Length (cm) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.lengthCm}
                onChange={(e) => setFormData({ ...formData, lengthCm: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Width (cm) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.widthCm}
                onChange={(e) => setFormData({ ...formData, widthCm: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Height (cm) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Package Type & Declared Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Package Classification</label>
              <select
                value={formData.packageType}
                onChange={(e) => setFormData({ ...formData, packageType: e.target.value as PackageType })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="PARCEL">General Parcel</option>
                <option value="DOCUMENT">Official Document / Envelope</option>
                <option value="ELECTRONICS">Sensitive Electronics</option>
                <option value="FRAGILE">Fragile Glass / Ceramics</option>
                <option value="PERISHABLE">Perishable Temperature Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="NORMAL">Standard Priority</option>
                <option value="HIGH">High Priority (Priority Routing)</option>
                <option value="CRITICAL">Critical / Time-Definite</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Declared Value (INR ₹)</label>
              <input
                type="number"
                min="0"
                value={formData.declaredValue}
                onChange={(e) => setFormData({ ...formData, declaredValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Service Level Radio Cards */}
          <div className="pt-2">
            <label className="block text-slate-400 font-medium text-xs mb-2">Select Service Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'SAME_DAY' as ServiceType,
                  title: 'Same-Day Metro',
                  desc: 'Direct courier dispatch within 8 hours',
                  badge: 'Fastest',
                },
                {
                  id: 'EXPRESS_AIR' as ServiceType,
                  title: 'Express Air Next-Day',
                  desc: 'Guaranteed 24-hr next flight cargo',
                  badge: 'Recommended',
                },
                {
                  id: 'PRIORITY_GROUND' as ServiceType,
                  title: 'Priority Ground',
                  desc: '2-3 business days interstate linehaul',
                  badge: 'Reliable',
                },
                {
                  id: 'STANDARD_FREIGHT' as ServiceType,
                  title: 'Standard Freight',
                  desc: '4-6 business days bulk consolidated',
                  badge: 'Economy',
                },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setFormData({ ...formData, serviceType: tier.id })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.serviceType === tier.id
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{tier.title}</span>
                    <span className="text-[10px] text-amber-400 font-mono">{tier.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add-on services */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.checked })}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Full Cargo Insurance (+₹250.00)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.fragile}
                onChange={(e) => setFormData({ ...formData, fragile: e.target.checked })}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Fragile Handling Caution (+₹150.00)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.signatureRequired}
                onChange={(e) => setFormData({ ...formData, signatureRequired: e.target.checked })}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Direct Signature Required</span>
            </label>
          </div>
        </div>

        {/* Pricing Summary & Confirmation Card */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Billable Weight:</span>
              <span className="font-mono font-bold text-white">{billableWeight} kg</span>
              <span className="text-slate-500">(Dim: {dimensionalWeight} kg)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Route:</span>
              <span className="font-semibold text-white">{formData.senderCity} &rarr; {formData.receiverCity}</span>
              <span className="text-slate-500">&middot; Service: {formData.serviceType}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block uppercase font-mono">Calculated Fee</span>
              <span className="text-2xl font-black text-amber-400 font-mono">₹{estimatedRate.toFixed(2)} INR</span>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow-lg shadow-red-600/20"
            >
              <span>Confirm &amp; Generate ST Docket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Generated Waybill Modal */}
      {showWaybill && createdShipment && (
        <WaybillModal
          shipment={createdShipment}
          onClose={() => {
            setShowWaybill(false);
            setActiveTab('tracking');
          }}
        />
      )}
    </div>
  );
};
