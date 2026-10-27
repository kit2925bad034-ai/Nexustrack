import React from 'react';
import { Shipment } from '../types';
import { X, Printer, Package, ShieldCheck, AlertTriangle } from 'lucide-react';

interface WaybillModalProps {
  shipment: Shipment | null;
  onClose: () => void;
}

export const WaybillModal: React.FC<WaybillModalProps> = ({ shipment, onClose }) => {
  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Controls (No print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold tracking-wide">Official Airway Bill / Consignment Note</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Waybill Sheet */}
        <div className="p-8 font-sans space-y-6">
          {/* Header Row */}
          <div className="flex items-start justify-between border-b-2 border-red-700 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-red-700 text-white rounded-lg flex items-center justify-center font-black text-base shadow">
                  QT
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-slate-950 font-sans">
                    <span className="text-red-700">QUICK</span>TRACK
                  </span>
                  <span className="text-[10px] text-red-700 font-bold block -mt-1 tracking-wider uppercase">
                    Delivering Express Logistics Across The Nation
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Regd Office: Mount Road, Guindy, Chennai-600032 &middot; GSTIN: 33AAECS4821M1Z5
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Category</span>
              <p className="text-base font-black text-red-700">{shipment.serviceType.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-500">Booked: {new Date(shipment.bookingDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Barcode Display */}
          <div className="flex flex-col items-center justify-center py-3 bg-slate-50 border border-slate-200 rounded p-4">
            {/* Synthetic Code-128 barcode simulation */}
            <div className="flex items-center justify-center h-16 gap-1 w-full max-w-md px-4">
              {Array.from({ length: 48 }).map((_, i) => {
                const isThick = (i % 3 === 0 || i % 7 === 0);
                const isDouble = (i % 5 === 0);
                return (
                  <div
                    key={i}
                    className={`bg-slate-950 h-full ${
                      isDouble ? 'w-1.5' : isThick ? 'w-1' : 'w-0.5'
                    }`}
                  />
                );
              })}
            </div>
            <p className="font-mono text-sm font-bold tracking-widest text-slate-800 mt-2">
              *{shipment.trackingNumber}*
            </p>
          </div>

          {/* Origin & Destination Grid */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded overflow-hidden">
            <div className="p-4 border-r border-slate-300 bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                1. Shipper / Origin (Sender)
              </span>
              <p className="font-bold text-slate-900 text-sm">{shipment.senderName}</p>
              <p className="text-xs text-slate-600 mt-0.5">{shipment.senderAddress}</p>
              <p className="text-xs font-semibold text-slate-800">{shipment.senderCity}</p>
              <p className="text-xs text-slate-500 mt-2 font-mono">Tel: {shipment.senderPhone}</p>
              <p className="text-xs text-slate-500 font-mono">Email: {shipment.senderEmail}</p>
            </div>

            <div className="p-4 bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                2. Consignee / Destination (Receiver)
              </span>
              <p className="font-bold text-slate-900 text-sm">{shipment.receiverName}</p>
              <p className="text-xs text-slate-600 mt-0.5">{shipment.receiverAddress}</p>
              <p className="text-xs font-semibold text-slate-800">{shipment.receiverCity}</p>
              <p className="text-xs text-slate-500 mt-2 font-mono">Tel: {shipment.receiverPhone}</p>
              <p className="text-xs text-slate-500 font-mono">Email: {shipment.receiverEmail}</p>
            </div>
          </div>

          {/* Package Specs & Handling */}
          <div className="grid grid-cols-4 gap-2 text-xs border border-slate-200 rounded p-3 bg-white">
            <div>
              <span className="text-slate-400 block font-medium">Actual Weight</span>
              <span className="font-bold text-slate-900 text-sm">{shipment.weightKg} kg</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Dimensions</span>
              <span className="font-bold text-slate-900 text-sm font-mono">
                {shipment.dimensionsCm.length}x{shipment.dimensionsCm.width}x{shipment.dimensionsCm.height} cm
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Cargo Type</span>
              <span className="font-bold text-slate-900 text-sm">{shipment.packageType}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Declared Value</span>
              <span className="font-bold text-slate-900 text-sm font-mono">₹{shipment.declaredValue.toFixed(2)}</span>
            </div>
          </div>

          {/* Special Flags & Delivery Note */}
          <div className="flex items-center justify-between p-3 border border-dashed border-slate-300 rounded bg-amber-50/50 text-xs">
            <div className="flex items-center gap-4">
              {shipment.fragile && (
                <div className="flex items-center gap-1 font-bold text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>FRAGILE CARGO</span>
                </div>
              )}
              {shipment.signatureRequired && (
                <div className="flex items-center gap-1 font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SIGNATURE REQUIRED</span>
                </div>
              )}
              {shipment.insurance && (
                <span className="text-slate-700 font-semibold">INSURED SHIPMENT</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-slate-500">Shipping Fee: </span>
              <span className="font-mono font-bold text-slate-900 text-sm">₹{shipment.shippingFee.toFixed(2)} INR</span>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
            <div>
              <p className="mb-8 font-medium">Shipper Signature &amp; Date:</p>
              <div className="border-b border-slate-400 w-full" />
            </div>
            <div>
              <p className="mb-8 font-medium">Receiver Acknowledgment &amp; Signature:</p>
              <div className="border-b border-slate-400 w-full" />
            </div>
          </div>
          
          <div className="text-center text-[10px] text-slate-500 pt-2 font-mono border-t border-slate-200">
            QuickTrack Network &middot; Docket No: {shipment.trackingNumber} &middot; All Shipments Subject to QuickTrack Terms &amp; Conditions
          </div>
        </div>
      </div>
    </div>
  );
};
