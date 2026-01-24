# 🔍 Data Storage Explanation

## ⚠️ IMPORTANT: You're Using MOCK DATA (In-Memory)

**There is NO database connection right now!**

### How Mock Data Works

Your reviews are stored in **JavaScript memory** (RAM), NOT in MySQL database.

**Current Mode:** `USE_MOCK_API = true` (line 19 in lib/api.ts)

### Where Data is Stored

```
frontend/lib/mockData.ts
├── mockProductReviews = [] ← Product reviews stored here
└── mockShopReviews = []     ← Shop reviews stored here
```

**When you submit a review:**
1. JavaScript creates a new review object
2. Pushes it to the array in memory
3. Data exists ONLY while server runs
4. **Refresh page = data still there**
5. **Restart server = data GONE**

---

## ✅ Proof Your Reviews ARE Being Stored

Open browser console (F12) and run:

```javascript
// See all product reviews in memory
console.log('Product Reviews:', window.__NEXT_DATA__);

// Or check the network tab:
// You'll see the reviews in the API responses
```

---

## 🔄 To Use Real Database Instead

1. **Start Backend:**
   ```bash
   cd "Review System"
   export JWT_SECRET="test-secret"
   ./gradlew bootRun
   ```

2. **Connect Frontend:**
   Edit `frontend/lib/api.ts` line 19:
   ```typescript
   const USE_MOCK_API = false;  // Change to false
   ```

3. **Now reviews save to MySQL!**

---

## 🐛 Current Issue

The error `rating.toFixed()` is because:
- Some shops have NO reviews yet
- Stats return `averageRating: 0` or `undefined`
- Component tries to call `.toFixed()` on undefined
- **I just fixed this** - page should reload automatically

---

## 📊 Check If Data is Stored

### Method 1: Console Log (Quick)

Add this to `lib/api.ts` after line 87:
```typescript
console.log('✅ Review stored!', newReview);
console.log('📦 Total reviews:', mockProductReviews.length);
```

### Method 2: Check My Reviews Page

- Go to "My Reviews"
- You should see all your submitted reviews
- Status will be "PENDING"

### Method 3: Refresh Product Page

- Go back to the product you reviewed
- Scroll to reviews section
- **Your review should be there!**

---

## 🎯 Summary

✅ **Reviews ARE being stored** (in memory)  
✅ **Data persists** while dev server runs  
⚠️ **NO database** - using mock data  
✅ **Just fixed** the rating display crash  

**Page should reload now - try submitting a review again!**
