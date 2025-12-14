'use client';

import { Shop } from '@/types/shop';
import { useRouter } from 'next/navigation';

interface ShopCardProps {
  shop: Shop;
  productCount?: number;
  topProducts?: string[];
}

const deliveryOptionLabels: Record<string, string> = {
  NO_DELIVERY: 'No Delivery',
  IN_HOUSE_DRIVER: 'In-house Delivery',
  THIRD_PARTY_PARTNER: '3rd Party Delivery',
};

export default function ShopCard({ shop, productCount = 0, topProducts = [] }: ShopCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/shop/${shop.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Shop Name - Larger text */}
      <h2 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '24px', 
        fontWeight: '600',
        color: '#333'
      }}>
        {shop.name}
      </h2>

      {/* Shop Address */}
      <p style={{ 
        margin: '0 0 8px 0', 
        color: '#666',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ fontSize: '16px' }}>📍</span>
        {shop.address}
      </p>

      {/* Phone */}
      <p style={{ 
        margin: '0 0 8px 0', 
        color: '#666',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ fontSize: '16px' }}>📞</span>
        {shop.phone}
      </p>

      {/* Open Hours */}
      <p style={{ 
        margin: '0 0 8px 0', 
        color: '#666',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ fontSize: '16px' }}>🕒</span>
        {shop.openHours}
      </p>

      {/* Delivery Option Badge */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
        </span>
      </div>

      {/* Divider */}
      <div style={{ 
        borderTop: '1px solid #e0e0e0', 
        margin: '12px 0',
        flex: '0 0 auto'
      }} />

      {/* Products Section */}
      <div style={{ flex: '1 1 auto' }}>
        <p style={{ 
          margin: '0 0 8px 0', 
          fontSize: '13px',
          fontWeight: '600',
          color: '#888'
        }}>
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>

        {topProducts.length > 0 && (
          <div>
            <p style={{ 
              margin: '0 0 4px 0', 
              fontSize: '12px',
              color: '#999',
              fontWeight: '500'
            }}>
              Featured:
            </p>
            <ul style={{ 
              margin: 0, 
              padding: '0 0 0 16px',
              listStyleType: 'disc'
            }}>
              {topProducts.slice(0, 3).map((productName, index) => (
                <li key={index} style={{ 
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '2px'
                }}>
                  {productName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {topProducts.length === 0 && (
          <p style={{ 
            margin: 0, 
            fontSize: '13px',
            color: '#999',
            fontStyle: 'italic'
          }}>
            No products yet
          </p>
        )}
      </div>

      {/* Click to view indicator */}
      <div style={{ 
        marginTop: '12px',
        fontSize: '13px',
        color: '#007bff',
        fontWeight: '500',
        textAlign: 'right'
      }}>
        View Details →
      </div>
    </div>
  );
}