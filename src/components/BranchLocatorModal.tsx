import React, { useState } from 'react';
import { MapPin, Phone, Search, X, Building2, CheckCircle2 } from 'lucide-react';

interface Branch {
  name: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  pincode: string;
  manager: string;
}

const QUICKTRACK_BRANCHES: Branch[] = [
  {
    name: 'Chennai Guindy Central Hub',
    code: 'QT-CHN-01',
    city: 'Chennai',
    district: 'Chennai',
    address: '58 Mount Road, Guindy Industrial Estate',
    phone: '044-22348891 / +91 98401 22890',
    pincode: '600032',
    manager: 'S. Ramanathan',
  },
  {
    name: 'Chennai Koyambedu Hub',
    code: 'QT-CHN-02',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Near Wholesale Market, Jawaharlal Nehru Road',
    phone: '044-24791102 / +91 98402 11002',
    pincode: '600107',
    manager: 'M. Anand',
  },
  {
    name: 'Coimbatore Peelamedu Main Hub',
    code: 'QT-CBE-01',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: '1100 Avinashi Road, Near PSG Tech',
    phone: '0422-2571234 / +91 98422 34567',
    pincode: '641004',
    manager: 'M. Senthil Kumar',
  },
  {
    name: 'Coimbatore RS Puram Branch',
    code: 'QT-CBE-02',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: 'DB Road, RS Puram West',
    phone: '0422-2549911 / +91 98423 88120',
    pincode: '641002',
    manager: 'K. Rajasekaran',
  },
  {
    name: 'Madurai Mattuthavani Hub',
    code: 'QT-MDU-01',
    city: 'Madurai',
    district: 'Madurai',
    address: '88 Melur Main Road, Opposite Omni Bus Stand',
    phone: '0452-2589001 / +91 94431 88912',
    pincode: '625007',
    manager: 'P. Murugan',
  },
  {
    name: 'Madurai West Veli Branch',
    code: 'QT-MDU-02',
    city: 'Madurai',
    district: 'Madurai',
    address: '42 West Veli Street, Periyar Bus Stand Road',
    phone: '0452-2341209 / +91 94432 10982',
    pincode: '625001',
    manager: 'T. Soundararajan',
  },
  {
    name: 'Tiruchirappalli Thillai Nagar Hub',
    code: 'QT-TRZ-01',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    address: '12 Salai Road, Thillai Nagar 11th Cross',
    phone: '0431-2741122 / +91 98431 33445',
    pincode: '620018',
    manager: 'N. Radhakrishnan',
  },
  {
    name: 'Salem Junction Transshipment Depot',
    code: 'QT-SLM-01',
    city: 'Salem',
    district: 'Salem',
    address: 'Junction Main Road, Suramangalam',
    phone: '0427-2441990 / +91 98427 12345',
    pincode: '636005',
    manager: 'V. Prakash',
  },
  {
    name: 'Tirunelveli Junction Branch',
    code: 'QT-TNV-01',
    city: 'Tirunelveli',
    district: 'Tirunelveli',
    address: 'Near Old Bus Stand, High Ground Road',
    phone: '0462-2331890 / +91 94433 99120',
    pincode: '627001',
    manager: 'A. Subbiah',
  },
  {
    name: 'Bengaluru Hosur Road Hub',
    code: 'QT-BLR-01',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    address: 'Bommanahalli Junction, Hosur Main Road',
    phone: '080-25731102 / +91 98450 78120',
    pincode: '560068',
    manager: 'R. Vignesh',
  },
  {
    name: 'Kochi Ernakulam Hub',
    code: 'QT-KOC-01',
    city: 'Kochi',
    district: 'Ernakulam',
    address: 'MG Road, Shenoys Junction, Ernakulam',
    phone: '0484-2371900 / +91 98470 22334',
    pincode: '682016',
    manager: 'George Varghese',
  },
  {
    name: 'Hyderabad Hitec City Depot',
    code: 'QT-HYD-01',
    city: 'Hyderabad',
    district: 'Hyderabad',
    address: 'Madhapur Main Road, Hitec City',
    phone: '040-23118901 / +91 94401 78912',
    pincode: '500081',
    manager: 'Srinivas Rao',
  },
];

export const BranchLocatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBranches = QUICKTRACK_BRANCHES.filter(b => {
    const q = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.district.toLowerCase().includes(q) ||
      b.pincode.includes(q) ||
      b.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-red-700/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header with QuickTrack theme */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white flex items-center justify-between border-b border-red-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-red-700 flex items-center justify-center font-black text-sm shadow">
              QT
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">QuickTrack Branch &amp; Pincode Locator</h2>
              <p className="text-[11px] text-red-100">Find nearest booking office or hub across 2,700+ nationwide locations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city (Chennai, Coimbatore, Madurai), branch name, or 6-digit Pincode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-sans"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>Showing {filteredBranches.length} branch booking offices</span>
            <span className="text-red-400 font-mono font-semibold">Toll-Free Help: 1800 208 8888</span>
          </div>
        </div>

        {/* Branch listing */}
        <div className="p-5 max-h-96 overflow-y-auto space-y-3 font-sans">
          {filteredBranches.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No branch matches your search term. Try searching "Coimbatore", "Chennai", or a pincode like "600032".
            </div>
          ) : (
            filteredBranches.map(b => (
              <div
                key={b.code}
                className="p-4 bg-slate-950/70 border border-slate-800 hover:border-red-600/50 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-mono text-[10px] font-bold border border-red-600/30">
                      {b.code}
                    </span>
                  </div>
                  <p className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{b.address}, {b.city} - PIN: <strong className="text-white font-mono">{b.pincode}</strong></span>
                  </p>
                  <p className="text-slate-400 text-[11px]">Branch Incharge: {b.manager}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <a
                    href={`tel:${b.phone.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold rounded-lg border border-red-600/40 transition-colors text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{b.phone.split('/')[0].trim()}</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
