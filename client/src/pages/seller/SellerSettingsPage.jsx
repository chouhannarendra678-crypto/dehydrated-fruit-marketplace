import React, { useState, useEffect } from 'react';
import {
  Building,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
} from '../../services/sellerApi';

const SellerSettingsPage = () => {
  const { data, isLoading } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateSellerProfileMutation();

  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('INDIVIDUAL');
  const [pan, setPan] = useState('');
  const [gst, setGst] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');

  // Business Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');

  // Bank / Payout Info
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [upiId, setUpiId] = useState('');

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (data?.data?.seller) {
      const s = data.data.seller;
      if (s.businessInfo) {
        setBusinessName(s.businessInfo.businessName || '');
        setBusinessType(s.businessInfo.businessType || 'INDIVIDUAL');
        setPan(s.businessInfo.pan || '');
        setGst(s.businessInfo.gst || '');
        setFssaiNumber(s.businessInfo.fssaiNumber || '');
      }
      if (s.businessAddress) {
        setStreet(s.businessAddress.street || '');
        setCity(s.businessAddress.city || '');
        setState(s.businessAddress.state || '');
        setPincode(s.businessAddress.pincode || '');
        setCountry(s.businessAddress.country || 'India');
      }
      if (s.bankInfo) {
        setAccountHolderName(s.bankInfo.accountHolderName || '');
        setAccountNumber(s.bankInfo.accountNumber || '');
        setIfscCode(s.bankInfo.ifscCode || '');
        setBankName(s.bankInfo.bankName || '');
        setBranchName(s.bankInfo.branchName || '');
        setUpiId(s.bankInfo.upiId || '');
      }
    }
  }, [data]);

  if (isLoading) {
    return <Loader message="Loading seller settings..." />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    try {
      await updateProfile({
        businessInfo: {
          businessName,
          businessType,
          pan: pan.toUpperCase(),
          gst: gst.toUpperCase(),
          fssaiNumber,
        },
        businessAddress: {
          street,
          city,
          state,
          pincode,
          country,
        },
        bankInfo: {
          accountHolderName,
          accountNumber,
          ifscCode: ifscCode.toUpperCase(),
          bankName,
          branchName,
          upiId,
        },
      }).unwrap();

      setFeedback({
        type: 'success',
        message: 'Business verification & payout details saved successfully!',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to save settings. Please verify details.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15">
        <h1 className="text-2xl font-bold font-display text-forest">Business Verification & Payout Settings</h1>
        <p className="text-xs text-ink-muted mt-1">
          Provide your FSSAI food business registration, tax PAN, and bank details for automated order payouts.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-forest/10 border border-forest/20 text-forest'
              : 'bg-tomato/10 border border-tomato/20 text-tomato'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-forest" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-tomato" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Business Information */}
        <div className="bg-oat-card rounded-lg p-6 tablet:p-8 border border-forest/15 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-forest/15">
            <Building className="w-5 h-5 text-forest" />
            <div>
              <h2 className="text-base font-bold font-display text-forest">Business Legal Entity</h2>
              <p className="text-xs text-ink-muted">Registered corporate or individual trading details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Legal Business Name"
              type="text"
              placeholder="e.g. Konkan Valley Agro Processors LLP"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
                Business Entity Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="block w-full rounded-md border border-forest/20 bg-oat-light/60 text-sm py-2.5 px-3 text-ink focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              >
                <option value="INDIVIDUAL">Individual / Farmer</option>
                <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                <option value="PARTNERSHIP">Partnership Firm</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
                <option value="PRIVATE_LIMITED">Private Limited Company</option>
              </select>
            </div>

            <Input
              label="Business PAN (Permanent Account Number)"
              type="text"
              placeholder="ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              helperText="10-character alphanumeric PAN"
            />

            <Input
              label="GSTIN (Optional for small farmers)"
              type="text"
              placeholder="27ABCDE1234F1Z5"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              helperText="15-character GST identification number"
            />
          </div>

          {/* FSSAI Notice */}
          <div className="p-4 rounded-md bg-oat border border-forest/20 space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-forest" />
              <span className="text-xs font-bold font-display text-forest">
                Food Safety and Standards Authority of India (FSSAI)
              </span>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              As this marketplace exclusively sells edible dehydrated and sun-dried fruits, compliance with FSSAI regulations is mandatory.
            </p>
            <Input
              label="14-Digit FSSAI License / Registration No."
              type="text"
              placeholder="12345678901234"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
              helperText="Exact 14-digit numeric license number"
            />
          </div>
        </div>

        {/* Section 2: Physical Processing / Farm Address */}
        <div className="bg-oat-card rounded-lg p-6 tablet:p-8 border border-forest/15 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-forest/15">
            <MapPin className="w-5 h-5 text-forest" />
            <div>
              <h2 className="text-base font-bold font-display text-forest">Facility / Farm Location</h2>
              <p className="text-xs text-ink-muted">Physical address of your drying facility or orchard</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Street / Industrial Area / Village"
              type="text"
              placeholder="Plot 42, MIDC Agro Food Park"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City / District"
                type="text"
                placeholder="Ratnagiri"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <Input
                label="State"
                type="text"
                placeholder="Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />

              <Input
                label="Pincode"
                type="text"
                placeholder="415612"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank Payout Account */}
        <div className="bg-oat-card rounded-lg p-6 tablet:p-8 border border-forest/15 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-forest/15">
            <CreditCard className="w-5 h-5 text-forest" />
            <div>
              <h2 className="text-base font-bold font-display text-forest">Bank Account for Payouts</h2>
              <p className="text-xs text-ink-muted">Disbursements for completed customer orders are transferred here</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Holder Name"
              type="text"
              placeholder="As registered with your bank"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
            />

            <Input
              label="Bank Account Number"
              type="password"
              placeholder="••••••••••••••"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />

            <Input
              label="IFSC Code"
              type="text"
              placeholder="HDFC0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              helperText="11-character bank branch code"
            />

            <Input
              label="Bank Name"
              type="text"
              placeholder="e.g. HDFC Bank, State Bank of India"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />

            <Input
              label="Branch Name"
              type="text"
              placeholder="e.g. Downtown Commercial Branch"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />

            <Input
              label="UPI ID (Optional for fast settlements)"
              type="text"
              placeholder="brand@okaxis"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={isUpdating} size="lg">
            Save Verification & Bank Information
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SellerSettingsPage;