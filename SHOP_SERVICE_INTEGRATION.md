# Shop Service Frontend Integration

## Overview
This document describes the frontend integration with the updated shop service backend API.

## Changes Made

### 1. Type Updates (`types/shop.ts`)
- Updated `Shop.ownerId` from `number` to `string` (UUID)
- Added `Category` type
- Added `category` field to `Shop` and `ShopRequest`
- Added `PagedResponse<T>` type for paginated responses
- Added inventory-related types: `InventoryResponse`, `AddInventoryRequest`, `UpdateInventoryRequest`

### 2. Product Type Updates (`types/product.ts`)
- Updated `Product` to match backend `ProductResponse`:
  - Removed `shopId`, `price`, `stock` (these are now in inventory)
  - Added `imageUrl` and `category` (Category object)
- Updated `ProductRequest` to match backend

### 3. API Hook Updates (`hooks/useApi.ts`)

#### Shop API (`shopApi`)
- ✅ `register(data)` → `POST /api/v1/shops/add`
- ✅ `getMyShops(page, size)` → `GET /api/v1/shops/mine?page={page}&size={size}` (now paginated)
- ✅ `getAllShops(page, size)` → `GET /api/v1/shops/all?page={page}&size={size}` (now paginated)
- ✅ `getShop(id)` → `GET /api/v1/shops/{id}`
- ✅ `updateShop(id, data)` → `PUT /api/v1/shops/{id}` (NEW)
- ✅ `delete(id)` → `DELETE /api/v1/shops/{id}`
- ✅ `deleteMultiple(ids)` → `DELETE /api/v1/shops/bulk`
- ✅ `search(params)` → `GET /api/v1/shops/search` (NEW)

#### Inventory API (`inventoryApi`) - NEW
- ✅ `getShopInventory(shopId)` → `GET /api/v1/shops/{shopId}/inventory`
- ✅ `getInventory(id)` → `GET /api/v1/inventory/{id}`
- ✅ `addInventory(shopId, data)` → `POST /api/v1/shops/{shopId}/inventory`
- ✅ `updateInventory(id, data)` → `PUT /api/v1/inventory/{id}`
- ✅ `deleteInventory(id)` → `DELETE /api/v1/inventory/{id}`
- ✅ `reserveStock(id, quantity)` → `POST /api/v1/inventory/{id}/reserve?quantity={quantity}`
- ✅ `releaseStock(id, quantity)` → `POST /api/v1/inventory/{id}/release?quantity={quantity}`

#### Product API (`productApi`)
- ✅ `add(data)` → `POST /api/v1/products`
- ✅ `getAll(page, size)` → `GET /api/v1/products?page={page}&size={size}` (now paginated)
- ✅ `getById(id)` → `GET /api/v1/products/{id}`
- ✅ `update(id, data)` → `PUT /api/v1/products/{id}`
- ✅ `delete(id)` → `DELETE /api/v1/products/{id}`
- ✅ `deleteMultiple(ids)` → `DELETE /api/v1/products/bulk`
- ❌ Removed: `getByShop(shopId)` - Use `inventoryApi.getShopInventory(shopId)` instead

### 4. Component Updates

#### Register Shop Page (`app/(protected)/register-shop/page.tsx`)
- ✅ Fixed delivery option values to match backend:
  - `NO_DELIVERY` (was: `PICKUP`)
  - `IN_HOUSE_DRIVER` (was: `DELIVERY`)
  - `THIRD_PARTY_PARTNER` (was: `BOTH`)
- ✅ Removed `ownerId` from form (handled by backend)

#### Dashboard Pages
- ✅ `app/(protected)/dashboard/page.tsx`:
  - Updated to handle paginated responses
  - Changed from `productApi.getByShop()` to `inventoryApi.getShopInventory()`
  
- ✅ `app/(protected)/admin/dashboard/page.tsx`:
  - Updated to handle paginated responses
  - Changed from `productApi.getByShop()` to `inventoryApi.getShopInventory()`

#### Delete Shops Pages
- ✅ `app/(protected)/delete-shops/page.tsx`:
  - Updated to handle paginated responses
  
- ✅ `app/(protected)/admin/delete-shops/page.tsx`:
  - Updated to handle paginated responses

#### Shop Detail Page (`app/(protected)/shop/[id]/page.tsx`)
- ✅ Updated to use `inventoryApi.getShopInventory()` instead of `productApi.getByShop()`
- ✅ Maps inventory data to include price and stock from inventory

#### Profile Shops Section (`app/(protected)/profile/_components/ShopsSection.tsx`)
- ✅ Implemented full functionality:
  - Fetches and displays user's shops
  - Shows shop count
  - "Add Shop" button navigates to register-shop
  - Empty state with call-to-action

## API Response Handling

### Pagination
All list endpoints now return `PagedResponse<T>`:
```typescript
{
  content: T[],
  page: number,
  size: number,
  totalElements: number,
  totalPages: number,
  first: boolean,
  last: boolean
}
```

Components handle both paginated and non-paginated responses for backward compatibility:
```typescript
const response = await shopApi.getMyShops();
const shopsList = Array.isArray(response) 
  ? response 
  : (response as PagedResponse<Shop>).content || [];
```

## Breaking Changes

1. **Product API**: `productApi.getByShop()` removed - use `inventoryApi.getShopInventory()` instead
2. **Shop ownerId**: Changed from `number` to `string` (UUID)
3. **Product structure**: Price and stock are now in inventory, not product
4. **Pagination**: All list endpoints now return paginated responses

## Migration Guide

### For Components Using Products
```typescript
// OLD
const products = await productApi.getByShop(shopId);

// NEW
const inventory = await inventoryApi.getShopInventory(shopId);
const products = inventory.map(inv => ({
  ...inv.product,
  price: inv.price,
  stock: inv.stock
}));
```

### For Components Using Shop Lists
```typescript
// OLD
const shops = await shopApi.getMyShops();

// NEW (handles pagination)
const response = await shopApi.getMyShops(0, 10);
const shops = Array.isArray(response) 
  ? response 
  : response.content || [];
```

## Testing Checklist

- [ ] Shop registration with correct delivery options
- [ ] Shop listing with pagination
- [ ] Shop update functionality
- [ ] Shop deletion (single and bulk)
- [ ] Shop search/filter
- [ ] Inventory management (add, update, delete)
- [ ] Product listing from inventory
- [ ] Stock reservation/release for cart
- [ ] Admin dashboard with all shops
- [ ] User dashboard with own shops
- [ ] Profile shops section

## Next Steps

1. Update `ProductForm` component to work with new product/inventory structure
2. Add inventory management UI components
3. Implement shop update form
4. Add shop search UI
5. Add pagination controls to list views
6. Add category selection in shop registration

