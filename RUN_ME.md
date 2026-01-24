# Quick Start Guide - Run the Frontend NOW!

## 🚀 Option 1: Run Without Fixing Permissions (Quickest!)

Try this first - it might just work:

```bash
cd "Review System/frontend"
npm run dev
```

If you see errors, use Option 2.

---

## 🔧 Option 2: Fix Permissions First (Recommended)

```bash
cd "Review System/frontend"

# 1. Fix npm cache ownership (requires your password)
sudo chown -R $(whoami) "$HOME/.npm"

# 2. Clean and install
npm cache clean --force
npm install --legacy-peer-deps

# 3. Run dev server
npm run dev
```

**Then open:** http://localhost:3000

---

## ✅ What You Should See

1. **Terminal output:**
   ```
   ✓ Ready in 3.2s
   ○ Local: http://localhost:3000
   ```

2. **Browser (http://localhost:3000):**
   - Beautiful product grid
   - 6 products with images and prices
   - Star ratings visible
   - Navigation bar at top

3. **Click any product:**
   - Product details page
   - Reviews listed
   - "Write a Review" button
   - Statistics sidebar

---

## 🧪 Test It Works

1. **Browse products** - Click around
2. **View product details** - Click "Wireless Headphones"
3. **Read reviews** - See existing mock reviews
4. **Submit a review:**
   - Click "Write a Review"
   - Rate 5 stars everywhere
   - Write "This is a test review!"
   - Submit
   - See success message!

---

## ❌ If You See Errors

**"next: command not found"**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**"Port 3000 already in use"**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**"EACCES permission denied"**
```bash
sudo chown -R $(whoami) "$HOME/.npm"
npm cache clean --force
npm install --legacy-peer-deps
```

---

## 🎯 Expected Result

Frontend running with full functionality using mock data - no backend needed!

Everything is ready - just run those commands! 🚀
