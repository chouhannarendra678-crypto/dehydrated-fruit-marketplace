import React, { useState } from 'react';
import { Home, Briefcase, MapPin, X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const AddressForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    fullName: initialValues?.fullName || '',
    phone: initialValues?.phone || '',
    street: initialValues?.street || '',
    apartment: initialValues?.apartment || '',
    city: initialValues?.city || '',
    state: initialValues?.state || 'Maharashtra',
    postalCode: initialValues?.postalCode || '',
    country: initialValues?.country || 'India',
    type: initialValues?.type || 'HOME',
    isDefault: initialValues?.isDefault || false,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, ''))) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.street.trim()) errs.street = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.postalCode.trim()) {
      errs.postalCode = 'Postal PIN code is required';
    } else if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      errs.postalCode = 'Enter a valid 6-digit PIN code';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-oat-card rounded-lg p-6 sm:p-8 border border-forest/15 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-forest/15">
        <h4 className="font-bold text-base font-display text-forest">
          {initialValues?._id ? 'Edit Delivery Address' : 'Add New Delivery Address'}
        </h4>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-md text-forest/60 hover:text-forest hover:bg-oat-dark/30 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Address Type Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-forest block">
          Address Type
        </label>
        <div className="flex items-center gap-2">
          {[
            { id: 'HOME', label: 'Home', icon: Home },
            { id: 'WORK', label: 'Work', icon: Briefcase },
            { id: 'OTHER', label: 'Other', icon: MapPin },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = formData.type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: t.id })}
                className={`px-3.5 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-forest bg-forest text-white shadow-2xs'
                    : 'border-forest/20 bg-oat text-forest hover:border-forest/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Recipient Name"
          required
          placeholder="e.g. Priya Sharma"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          error={errors.fullName}
        />
        <Input
          label="10-Digit Mobile Number"
          required
          placeholder="e.g. 9876543210"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
        />
      </div>

      {/* Street Address */}
      <Input
        label="Flat, House no., Building, Apartment"
        placeholder="e.g. Flat 402, Green Orchid Heights"
        value={formData.apartment}
        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
      />

      <Input
        label="Area, Street, Sector, Village"
        required
        placeholder="e.g. Plot 12, Main Orchard Road, Shivaji Nagar"
        value={formData.street}
        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
        error={errors.street}
      />

      {/* City, State, PIN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City / District"
          required
          placeholder="e.g. Ratnagiri"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          error={errors.city}
        />

        <div className="space-y-1">
          <label className="text-xs font-bold text-forest block">
            State <span className="text-tomato">*</span>
          </label>
          <select
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-md border border-forest/20 bg-oat-light/60 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-xs text-tomato mt-1">{errors.state}</p>}
        </div>

        <Input
          label="6-Digit PIN Code"
          required
          placeholder="e.g. 415612"
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          error={errors.postalCode}
          maxLength={6}
        />
      </div>

      {/* Make Default Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="w-4 h-4 rounded border-forest/30 text-forest focus:ring-forest"
        />
        <label htmlFor="isDefault" className="text-xs text-ink-muted cursor-pointer">
          Set as default delivery address for future orders
        </label>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-forest/15">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={isLoading}>
          Save Delivery Address
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
