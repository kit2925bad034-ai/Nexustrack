import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Building2, 
  ExternalLink,
  X
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { Customer } from '../types';
import { ActiveTab } from './Navbar';

interface CustomerDirectoryViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const CustomerDirectoryView: React.FC<CustomerDirectoryViewProps> = ({ setActiveTab }) => {
  const { customers, shipments, createCustomer, selectShipmentByTracking } = useCourier();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('Bengaluru');

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    createCustomer({
      fullName: newCustName,
      phone: newCustPhone,
      email: newCustEmail,
      company: newCustCompany,
      address: newCustAddress,
      city: newCustCity,
    });

    setShowAddModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustCompany('');
    setNewCustAddress('');
  };

  const getCustomerShipments = (cust: Customer) => {
    return shipments.filter(s => 
      s.senderId === cust.customerId || 
      s.receiverId === cust.customerId ||
      s.senderPhone === cust.phone ||
      s.receiverPhone === cust.phone
    );
  };

  const handleTrackShipment = (trackingNo: string) => {
    selectShipmentByTracking(trackingNo);
    setActiveTab('tracking');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Customer Directory &amp; Accounts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered corporate clients and retail shippers with transaction histories and account profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add QuickTrack Client</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredCustomers.length} client records
        </span>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => (
          <div
            key={cust.customerId}
            onClick={() => setSelectedCustomer(cust)}
            className="p-5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all cursor-pointer shadow-lg group space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 block font-bold">
                  {cust.customerId}
                </span>
                <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                  {cust.fullName}
                </h3>
                {cust.company && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{cust.company}</span>
                  </p>
                )}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">
                {cust.tier}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{cust.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{cust.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{cust.address}, {cust.city}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              <span className="font-mono">Bookings: <strong className="text-white">{cust.totalBookings}</strong></span>
              <span className="font-mono">Total Spent: <strong className="text-amber-400">₹{cust.totalSpent.toFixed(2)}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Customer Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 space-y-6 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedCustomer.customerId}</span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedCustomer.fullName}</h2>
                <p className="text-xs text-slate-400">{selectedCustomer.company || 'Private Shipper'}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Phone</span>
                <span className="font-medium text-white">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email</span>
                <span className="font-medium text-white">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Default Pickup Address</span>
                <span className="font-medium text-white">{selectedCustomer.address}, {selectedCustomer.city}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lifetime Shipments</span>
                <span className="font-mono font-bold text-amber-400">{selectedCustomer.totalBookings} orders (₹{selectedCustomer.totalSpent.toFixed(2)})</span>
              </div>
            </div>

            {/* Associated Shipments */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Associated Consignment Shipments</span>
              </h3>
              
              {getCustomerShipments(selectedCustomer).length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No active consignments found for this account.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getCustomerShipments(selectedCustomer).map(s => (
                    <div
                      key={s.trackingNumber}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-amber-400 block">{s.trackingNumber}</span>
                        <span className="text-slate-300">
                          {s.senderCity} &rarr; {s.receiverCity} ({s.status})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCustomer(null);
                          handleTrackShipment(s.trackingNumber);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Register New Customer Profile</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Company / Organization (Optional)</label>
                <input
                  type="text"
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Default Pickup Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">City</label>
                <select
                  value={newCustCity}
                  onChange={(e) => setNewCustCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
