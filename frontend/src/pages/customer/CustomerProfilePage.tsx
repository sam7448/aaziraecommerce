import React, { useState, useEffect } from 'react';
import { User, MapPin, Plus, Check, Trash2, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SavedAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');

  // Load user profile & saved addresses from storage
  const storageAddressKey = user ? `user_addresses_${user.id}` : 'user_addresses_guest';
  const storagePhoneKey = user ? `user_phone_${user.id}` : 'user_phone_guest';

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(() => localStorage.getItem(storagePhoneKey) || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Address state - loaded dynamically from localStorage, starts empty if user hasn't added any!
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem(storageAddressKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    recipientName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (user?.fullName && !fullName) {
      setFullName(user.fullName);
    }
  }, [user?.fullName]);

  // Persist addresses whenever changed
  const saveAddresses = (newAddrs: SavedAddress[]) => {
    setAddresses(newAddrs);
    localStorage.setItem(storageAddressKey, JSON.stringify(newAddrs));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(storagePhoneKey, phone);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SavedAddress = {
      id: 'addr-' + Date.now(),
      ...newAddr,
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, created];
    saveAddresses(updated);
    setShowAddAddress(false);
    setNewAddr({ recipientName: '', phone: '', addressLine1: '', city: '', state: '', postalCode: '' });
  };

  const setDefault = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated);
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage personal profile details and saved delivery addresses</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> Personal Information
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'addresses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Delivery Addresses ({addresses.length})
        </button>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xl font-bold">
              {fullName ? fullName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{fullName || user?.email || 'User Profile'}</h2>
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 234 567 8900"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Role</label>
              <input
                type="text"
                disabled
                value={user?.role?.toUpperCase() || 'CUSTOMER'}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {profileSaved && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-slate-900">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={newAddr.recipientName}
                  onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                  className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  value={newAddr.addressLine1}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                  className="sm:col-span-2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Postal Code"
                  value={newAddr.postalCode}
                  onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                  className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">No saved addresses</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                You haven't saved any delivery addresses yet. Add an address to speed up checkout.
              </p>
              <button
                type="button"
                onClick={() => setShowAddAddress(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add your first address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    a.isDefault ? 'border-indigo-600 bg-indigo-50/20 shadow-sm' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 text-sm">{a.recipientName}</span>
                    <div className="flex items-center gap-2">
                      {a.isDefault && (
                        <span className="text-[10px] font-bold uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      <button
                        onClick={() => deleteAddress(a.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>{a.addressLine1}</p>
                    <p>
                      {a.city}, {a.state} {a.postalCode}
                    </p>
                    {a.phone && <p>Phone: {a.phone}</p>}
                  </div>
                  {!a.isDefault && (
                    <button
                      onClick={() => setDefault(a.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
