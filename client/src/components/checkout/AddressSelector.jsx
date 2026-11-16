import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Home,
  Briefcase,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import Button from '../common/Button';
import Loader from '../common/Loader';
import AddressForm from './AddressForm';
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from '../../services/addressApi';

const AddressSelector = ({
  selectedAddressId,
  onSelectAddress,
}) => {
  const { data, isLoading } = useGetAddressesQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const addresses = data?.data?.addresses || [];

  const handleSaveAddress = async (formData) => {
    try {
      if (editingAddress?._id) {
        await updateAddress({ id: editingAddress._id, ...formData }).unwrap();
      } else {
        const res = await createAddress(formData).unwrap();
        if (res?.data?.address?._id) {
          onSelectAddress(res.data.address._id);
        }
      }
      setShowForm(false);
      setEditingAddress(null);
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this delivery address?')) {
      try {
        await deleteAddress(id).unwrap();
      } catch (err) {
        console.error('Failed to delete address:', err);
      }
    }
  };

  const handleSetDefault = async (e, id) => {
    e.stopPropagation();
    try {
      await setDefaultAddress(id).unwrap();
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  if (isLoading) {
    return <Loader message="Loading your delivery addresses..." />;
  }

  // If user has no addresses yet or opened the form
  if (showForm || addresses.length === 0) {
    return (
      <div className="space-y-4">
        {addresses.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
            className="text-xs font-semibold text-forest hover:underline cursor-pointer"
          >
            ← Back to Saved Addresses
          </button>
        )}
        <AddressForm
          initialValues={editingAddress}
          onSubmit={handleSaveAddress}
          onCancel={addresses.length > 0 ? () => {
            setShowForm(false);
            setEditingAddress(null);
          } : null}
          isLoading={isCreating || isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-forest/15">
        <div>
          <h3 className="text-base font-bold font-display text-forest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest" />
            <span>Select Delivery Address</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Choose where your dried fruit batches should be dispatched.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="text-xs font-bold text-forest hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr._id || (!selectedAddressId && addr.isDefault);
          const TypeIcon = addr.type === 'WORK' ? Briefcase : addr.type === 'HOME' ? Home : MapPin;

          return (
            <div
              key={addr._id}
              onClick={() => onSelectAddress(addr._id)}
              className={`p-5 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-forest bg-oat-light/80 shadow-2xs ring-1 ring-forest'
                  : 'border-forest/15 hover:border-forest/30 bg-oat-card'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-oat text-forest text-xs border border-forest/15">
                      <TypeIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-xs text-forest">{addr.type}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-forest" />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold font-display text-sm text-forest">{addr.fullName}</h4>
                  <p className="text-xs text-ink mt-0.5 leading-relaxed">
                    {addr.street}
                    {addr.apartment ? `, ${addr.apartment}` : ''}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {addr.city}, {addr.state} - <span className="font-mono font-medium text-forest">{addr.postalCode}</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    Phone: <span className="font-medium text-ink">{addr.phone}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-forest/10 flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={(e) => handleSetDefault(e, addr._id)}
                    className="text-[11px] font-semibold text-ink-muted hover:text-forest cursor-pointer"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-[11px] text-forest font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Preferred
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(addr);
                      setShowForm(true);
                    }}
                    className="text-ink-muted hover:text-forest inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, addr._id)}
                    className="text-ink-muted hover:text-tomato inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddressSelector;