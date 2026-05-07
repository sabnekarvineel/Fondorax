# Backend Server Setup & Integration

## 📋 Files Created (Phase 1)

```
backend/
├── controllers/
│   ├── marketplaceController.js (NEW) ✅
│   └── dealController.js (NEW) ✅
├── routes/
│   ├── marketplace.js (NEW) ✅
│   └── deals.js (NEW) ✅
└── SERVER_SETUP.md (this file)
```

---

## 🔧 How to Integrate into server.js

Your current `backend/server.js` should be updated to include the new routes.

### Step 1: Check Current server.js

Open your `backend/server.js` and locate where routes are registered.

**Typical structure:**
```javascript
// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/fondorax');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
// ... other routes

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Step 2: Add New Routes

Add these two lines in the routes section (after other routes):

```javascript
// Marketplace routes
app.use('/api/marketplace', require('./routes/marketplace'));

// Deal routes
app.use('/api/deals', require('./routes/deals'));
```

**Complete example:**
```javascript
// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/fondorax');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// NEW: Marketplace & Deal routes
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/deals', require('./routes/deals'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Step 3: Ensure Auth Middleware Exists

The routes use `auth` middleware. Make sure you have:

File: `backend/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
```

### Step 4: Ensure Models Exist

Make sure these models exist:
- ✅ `backend/models/Marketplace.js` (already created & updated)
- ✅ `backend/models/Deal.js` (already created)
- ✅ `backend/models/User.js` (should already exist)

### Step 5: Ensure Services Exist

Make sure these services exist:
- ✅ `backend/services/valuationService.js` (already created)

---

## 🧪 Testing the API

### Test with Postman

#### 1. Create Listing

```http
POST http://localhost:5000/api/marketplace/listings
Content-Type: application/json
Authorization: Bearer {YOUR_JWT_TOKEN}

{
  "title": "AI Resume Builder",
  "description": "AI-powered resume writing platform",
  "industry": "AI/ML",
  "monthlyRevenue": 80000,
  "growthRate": 15,
  "askingPrice": 3500000,
  "location": "San Francisco, USA",
  "customerCount": 250,
  "churnRate": 5,
  "techStack": ["React", "Node.js", "MongoDB"]
}
```

**Expected Response (201):**
```json
{
  "message": "Listing created successfully",
  "listing": {
    "_id": "listing_123",
    "title": "AI Resume Builder",
    "monthlyRevenue": 80000,
    "askingPrice": 3500000,
    "valuationScore": {
      "baseValue": 48000000,
      "growthBonus": 3600000,
      "totalValue": 51600000,
      "multiple": 5.5
    },
    "status": "active",
    "dealStatus": "none",
    "createdAt": "2024-02-21T10:30:00Z"
  }
}
```

#### 2. Get All Listings

```http
GET http://localhost:5000/api/marketplace/listings?industry=AI/ML&revenueMin=50000&sortBy=newest&page=1&limit=12
Content-Type: application/json
Authorization: Bearer {YOUR_JWT_TOKEN}
```

#### 3. Express Interest

```http
POST http://localhost:5000/api/deals/express-interest/{LISTING_ID}
Content-Type: application/json
Authorization: Bearer {BUYER_JWT_TOKEN}
```

#### 4. Get My Interests (Buyer)

```http
GET http://localhost:5000/api/deals/my-interests?status=interested&page=1&limit=12
Content-Type: application/json
Authorization: Bearer {BUYER_JWT_TOKEN}
```

#### 5. Get Interests Received (Seller)

```http
GET http://localhost:5000/api/deals/interests-received/{LISTING_ID}
Content-Type: application/json
Authorization: Bearer {SELLER_JWT_TOKEN}
```

---

## 🔗 API Endpoints Summary

### Marketplace Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/marketplace/listings` | Create listing |
| GET | `/api/marketplace/listings` | Get all listings (with filters) |
| GET | `/api/marketplace/listings/:id` | Get single listing |
| PUT | `/api/marketplace/listings/:id` | Update listing |
| DELETE | `/api/marketplace/listings/:id` | Delete listing |
| POST | `/api/marketplace/listings/:id/save` | Save to wishlist |
| GET | `/api/marketplace/saved` | Get saved listings |
| GET | `/api/marketplace/listings/:id/valuation` | Get valuation |
| POST | `/api/marketplace/valuations/calculate` | Calculate valuation |
| GET | `/api/marketplace/filters/options` | Get filter options |

### Deal Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/deals/express-interest/:listingId` | Express interest |
| GET | `/api/deals/my-interests` | Buyer dashboard |
| GET | `/api/deals/interests-received/:listingId` | Seller dashboard |
| GET | `/api/deals/:dealId` | Deal details |
| PUT | `/api/deals/:dealId/status` | Update deal status |
| POST | `/api/deals/:dealId/negotiate` | Submit offer |
| GET | `/api/deals/:dealId/negotiations` | Negotiation history |
| POST | `/api/deals/:dealId/accept-offer` | Accept offer |
| POST | `/api/deals/:dealId/reject` | Reject deal |
| POST | `/api/deals/:dealId/sign-nda` | Sign NDA |
| POST | `/api/deals/:dealId/upload-document` | Upload document |
| GET | `/api/deals/:dealId/documents` | Get documents |

---

## 🧬 Database Models Reference

### Marketplace (Listing)
```javascript
{
  _id: ObjectId,
  founderId: ObjectId (ref: User),
  title: String,
  description: String,
  industry: String,
  monthlyRevenue: Number,
  growthRate: Number,
  askingPrice: Number,
  valuationScore: {
    baseValue: Number,
    growthBonus: Number,
    totalValue: Number,
    multiple: Number,
    calculatedAt: Date
  },
  interests: [{
    buyerId: ObjectId,
    stage: String,
    interestedAt: Date,
    ndaSignedAt: Date,
    closedAt: Date,
    agreedPrice: Number
  }],
  status: String (active, sold, closed),
  dealStatus: String (none, interest_received, nda_signed, due_diligence, negotiating, closed),
  revenueVerified: Boolean,
  founderVerified: Boolean,
  views: Number,
  saves: [ObjectId],
  interestCount: Number,
  techStack: [String],
  customerCount: Number,
  churnRate: Number
}
```

### Deal
```javascript
{
  _id: ObjectId,
  listingId: ObjectId (ref: Marketplace),
  buyerId: ObjectId (ref: User),
  sellerId: ObjectId (ref: User),
  status: String (interested, nda_pending, nda_signed, due_diligence, negotiating, closed),
  interestedAt: Date,
  ndaSignedAt: Date,
  ndaSignedByBuyer: Boolean,
  ndaSignedBySeller: Boolean,
  dueDiligenceStartedAt: Date,
  negotiationStartedAt: Date,
  closedAt: Date,
  listingPrice: Number,
  offerPrice: Number,
  agreedPrice: Number,
  negotiationHistory: [{
    fromUserId: ObjectId,
    message: String,
    proposedPrice: Number,
    timestamp: Date
  }],
  dueDiligenceDocuments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date,
    uploadedBy: ObjectId
  }],
  escrowStatus: String
}
```

---

## 📊 Complete API Flow Example

### Buyer & Seller Flow

**1. Seller creates listing**
```
POST /api/marketplace/listings
→ Listing created with auto-calculated valuation
```

**2. Buyer browses listings**
```
GET /api/marketplace/listings?industry=AI/ML&revenueMin=50000
→ Returns filtered listings
```

**3. Buyer views listing details**
```
GET /api/marketplace/listings/{id}
→ Returns full listing with valuation
```

**4. Buyer expresses interest**
```
POST /api/deals/express-interest/{listingId}
→ Deal created, seller notified
```

**5. Seller sees interest received**
```
GET /api/deals/interests-received/{listingId}
→ Shows all interested buyers
```

**6. Both sign NDA**
```
POST /api/deals/{dealId}/sign-nda
→ NDA tracking for both parties
```

**7. Documents shared**
```
POST /api/deals/{dealId}/upload-document
→ Due diligence documents uploaded
```

**8. Negotiation begins**
```
POST /api/deals/{dealId}/negotiate
→ Price counter-offers exchanged
```

**9. Deal accepted**
```
POST /api/deals/{dealId}/accept-offer
→ Deal marked closed, listing marked sold
```

---

## 🚀 Verification Checklist

After integrating, verify:

- [ ] Import statements are correct in server.js
- [ ] Routes are registered before error middleware
- [ ] Auth middleware exists and works
- [ ] Models are properly defined
- [ ] Controllers import models correctly
- [ ] Database connection is working
- [ ] JWT_SECRET is set in .env

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'marketplace'"
**Solution:** Check route import path in server.js
```javascript
// Correct
app.use('/api/marketplace', require('./routes/marketplace'));

// Ensure file exists at: backend/routes/marketplace.js
```

### Issue: "auth is not a function"
**Solution:** Verify auth middleware
```javascript
// backend/middleware/auth.js must exist and export a function
module.exports = (req, res, next) => { ... }
```

### Issue: "Model not found"
**Solution:** Import model in controller
```javascript
const Marketplace = require('../models/Marketplace');
const Deal = require('../models/Deal');
```

### Issue: "JWT verification failed"
**Solution:** Ensure token is sent correctly
```
Header: Authorization: Bearer {token_without_spaces}
```

### Issue: "CORS error"
**Solution:** Enable CORS in server.js
```javascript
const cors = require('cors');
app.use(cors());
```

---

## 📝 Next Steps (Phase 2)

After Phase 1 is working:

1. **Test all endpoints** with Postman
2. **Build buyer dashboard** (React component)
3. **Build seller dashboard** (React component)
4. **Implement notifications** when deals progress
5. **Add payment integration** (Razorpay)

---

## 🆘 Need Help?

1. Check `API_SPECIFICATION.md` for endpoint details
2. Review controller code for logic
3. Verify database models match schema
4. Test endpoints with Postman
5. Check console for error messages

---

**Status:** Phase 1 Complete ✅
**Next:** Wire frontend to these APIs
**Timeline:** Ready for Phase 2 implementation

