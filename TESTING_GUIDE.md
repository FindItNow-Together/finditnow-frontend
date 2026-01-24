# Review System Frontend - Testing Guide

## 🚀 Quick Start

The frontend is ready to run with **mock data** - no backend needed for testing!

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

### ✅ Fully Functional with Mock Data
- Browse products and shops
- View reviews and ratings
- Submit new reviews
- See rating statistics
- Pagination support
- All without needing the backend running!

### 🎨 Beautiful UI
- Modern, responsive design
- Interactive star ratings
- Smooth animations
- Loading states
- Empty states

### 📊 Mock Data Included
- **6 Products** across 3 shops
- **8 Product Reviews** with diverse ratings
- **5 Shop Reviews** 
- Realistic data for comprehensive testing

## 📱 Pages

### 1. Products List (`/`)
- Grid of all products
- Average ratings displayed
- Click to view details

### 2. Product Detail (`/products/[id]`)
- Full product information
- Review submission form
- List of customer reviews
- Detailed statistics with rating distribution
- Criteria breakdown (quality, delivery)

### 3. Shops (`/shops`)
- List of all shops
- Shop ratings and reviews

### 4. Shop Detail (`/shops/[id]`)
- Shop information
- Review submission form
- Shop reviews list
- Statistics with owner interaction, shop quality, delivery ratings

### 5. My Reviews (`/my-reviews`)
- All reviews submitted by current user (mock user: John Doe)
- Both product and shop reviews

## 🧪 Testing Scenarios

### Test Review Submission

1. Go to any product page
2. Click "Write a Review"
3. Fill in ratings:
   - Overall Rating (1-5 stars)
   - Product Quality (1-5 stars)
   - Delivery Speed (1-5 stars)
4. Write a comment (min 10 characters)
5. Click "Submit Review"
6. Review appears immediately with "Pending Approval" status

### Test Statistics

- View rating distributions
- See average ratings update
- Check criteria breakdowns

### Test Navigation
- Browse products → click product → see reviews
- Navigate to shops → view shop reviews
- Check "My Reviews" page

## 🔧 Configuration

### Switch to Real API

Edit `frontend/lib/api.ts`:

```typescript
// Change from
const USE_MOCK_API = true;

// To
const USE_MOCK_API = false;
```

The frontend will then connect to `http://localhost:8080/api`

### API Base URL

Update `API_BASE_URL` in `frontend/lib/api.ts` if your backend runs elsewhere.

## 📦 Mock Data Details

### Products
1. Wireless Headphones ($199.99) - 3 reviews, 4.5 avg
2. Smart Watch ($299.99) - 1 review, 4.5 avg
3. Designer Handbag ($159.99) - 1 review, 5.0 avg
4. Running Shoes ($129.99) - 1 review (pending)
5. Coffee Maker ($89.99) - 1 review, 4.5 avg
6. Air Purifier ($179.99) - 1 review, 3.5 avg

### Shops
1. Tech Paradise - 3 reviews
2. Fashion Hub - 1 review
3. Home Essentials - 1 review

## 🎯 What Works

✅ Product browsing  
✅ Shop browsing  
✅ Review submission  
✅ Star ratings (interactive + display)  
✅ Review statistics  
✅ Rating distributions  
✅ Pagination support  
✅ Form validation  
✅ Loading states  
✅ Success/error messages  
✅ Responsive design  

## 📝 Notes

- **Current User**: Mock user "John Doe" (ID: 1)
- **Order IDs**: Auto-generated for testing (100 + productId/shopId)
- **Review Status**: New reviews start as "PENDING"
- **Instant Updates**: Changes reflect immediately in mock mode
- **No Authentication**: Mock user is always logged in for testing

## 🔄 Reset Mock Data

Restart the development server to reset all mock data to initial state.

## 🚀 Production Build

```bash
npm run build
npm start
```

Runs optimized production build on port 3000.

## 📸 Screenshots

Try these actions:
1. Submit a 5-star review → See stats update
2. Submit a 1-star review → See distribution change
3. Browse between products → See different ratings
4. Check "My Reviews" → See your mock reviews

## ✨ Ready for Real Backend

When your Spring Boot backend is ready:
1. Set `USE_MOCK_API = false` in `lib/api.ts`
2. Make sure backend runs on `localhost:8080`
3. Set JWT token if needed
4. All API calls will work automatically!

Enjoy testing! 🎉
