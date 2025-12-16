'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { shopApi } from '@/lib/api';
import { DeliveryOption } from '@/types/shop';
import {useAuth} from "@/contexts/AuthContext";

const deliveryOptions = [
  { value: 'NO_DELIVERY', label: 'No Delivery Service' },
  { value: 'IN_HOUSE_DRIVER', label: 'In-house Delivery Driver' },
  { value: 'THIRD_PARTY_PARTNER', label: '3rd Party Delivery Partner' },
];

export default function RegisterShopPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    openHours: '',
    deliveryOption: deliveryOptions[0].value,
    ownerId: '',
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState('Detecting current location...');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  /**
   * Helper to fetch the user's current geolocation using the browser API.
   * This runs on page load and can be triggered manually by the user.
   */
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser.');
      return;
    }

    setLocationStatus('Fetching current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus('Location captured from your device.');
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        setLocationStatus('Unable to capture location. Please allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // if (isLoading) {
  //   return <div className="container">Loading...</div>;
  // }

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (latitude === null || longitude === null) {
      setError('Unable to detect your current location. Please allow location access and try again.');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        ...formData,
        deliveryOption: formData.deliveryOption as DeliveryOption,
        latitude,
        longitude,
      };

      // Only include ownerId if it's provided and user is admin
      if (isAdmin && formData.ownerId) {
        payload.ownerId = parseInt(formData.ownerId);
      } else {
        delete payload.ownerId;
      }

      await shopApi.register(payload);

      // Redirect based on role
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register shop');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <h1 style={{ marginBottom: '24px' }}>Register Your Shop</h1>

        {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Shop Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="openHours">Open Hours *</label>
            <input
              type="text"
              id="openHours"
              name="openHours"
              placeholder="e.g., Mon-Sat: 9 AM - 9 PM"
              value={formData.openHours}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryOption">Delivery Option *</label>
            <select
              id="deliveryOption"
              name="deliveryOption"
              value={formData.deliveryOption}
              onChange={handleChange}
              required
            >
              {deliveryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small style={{ color: '#666' }}>
              Choose how customers can receive deliveries from your shop.
            </small>
          </div>

          {isAdmin && (
            <div className="form-group" style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '4px', border: '1px solid #ffc107' }}>
              <label htmlFor="ownerId">Owner ID (Admin Only)</label>
              <input
                type="number"
                id="ownerId"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                placeholder="Enter User ID to assign shop to"
              />
              <small style={{ color: '#856404' }}>
                Leave blank to assign to yourself. Enter a User ID to assign this shop to another user.
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Current Location (captured automatically)</label>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>Latitude: {latitude ?? 'Detecting...'}</p>
              <p style={{ margin: 0, fontWeight: 600 }}>Longitude: {longitude ?? 'Detecting...'}</p>
              <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>{locationStatus}</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fetchCurrentLocation}
            >
              Refresh Current Location
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Registering...' : 'Register Shop'}
          </button>
        </form>
      </div>
    </div>
  );
}

